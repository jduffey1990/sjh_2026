import { get, set } from "idb-keyval";
import { supabase, hasBackend } from "./supabase";
import {
  EMPTY,
  type Snapshot,
  type SyncStatus,
  type OutboxEntry,
  type GroupItem,
  type Claim,
  type PersonalItem,
  type DbRider,
  type Decision,
  type Comment,
  type LogisticsField,
  type SeenMarker,
  type Scope,
} from "./types";

const CACHE_KEY = "sjh2026.snapshot";
const OUTBOX_KEY = "sjh2026.outbox";

type Table = OutboxEntry["table"];

/** Give up on a single row after this many failed sync attempts. */
const MAX_ATTEMPTS = 5;

/**
 * Upsert conflict targets.
 *
 * `claims` has a unique (group_item_id, rider_id) constraint, so an offline
 * claim carrying a locally-generated id can collide with one the same rider
 * already made on another device. Resolving on the natural key merges the
 * two instead of failing; without this the queue jams on a 409.
 */
const CONFLICT_TARGET: Record<Table, string> = {
  riders: "id",
  group_items: "id",
  claims: "group_item_id,rider_id",
  personal_items: "id",
  decisions: "id",
  comments: "id",
  logistics_fields: "id",
  seen_markers: "rider_id,scope,scope_id",
};

const TABLE_TO_FIELD: Record<Table, keyof Snapshot> = {
  riders: "riders",
  group_items: "groupItems",
  claims: "claims",
  personal_items: "personalItems",
  decisions: "decisions",
  comments: "comments",
  logistics_fields: "logisticsFields",
  seen_markers: "seenMarkers",
};

/**
 * Offline-first store.
 *
 * The UI always renders from an in-memory snapshot that is mirrored to
 * IndexedDB, so the board opens instantly and works with no signal -- which
 * is the normal condition between Telluride and the Gateway store on day 5.
 *
 * Writes apply locally first, then queue in an outbox. When the network
 * comes back the outbox replays in order; Postgres stamps updated_at, so
 * concurrent edits resolve last-write-wins per row. That is the right
 * amount of machinery for eight friends ticking off gear.
 */
class Store {
  private snap: Snapshot = EMPTY;
  private outbox: OutboxEntry[] = [];
  private listeners = new Set<() => void>();
  private status: SyncStatus = hasBackend ? "loading" : "no-backend";
  private started = false;
  private flushing = false;

  // ---- subscription -------------------------------------------------
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getSnapshot = () => this.snap;
  getStatus = () => this.status;
  getPending = () => this.outbox.length;

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  private setSnap(next: Snapshot, persist = true) {
    this.snap = next;
    if (persist) void set(CACHE_KEY, next);
    this.emit();
  }

  private setStatus(s: SyncStatus) {
    if (this.status === s) return;
    this.status = s;
    this.emit();
  }

  // ---- lifecycle ----------------------------------------------------
  async start() {
    if (this.started) return;
    this.started = true;

    // 1. Paint from cache immediately -- no spinner if we have been here.
    const [cached, queued] = await Promise.all([
      get<Snapshot>(CACHE_KEY),
      get<OutboxEntry[]>(OUTBOX_KEY),
    ]);
    if (cached) this.setSnap(cached, false);
    if (queued?.length) this.outbox = queued;

    if (!hasBackend) {
      this.setStatus("no-backend");
      return;
    }

    window.addEventListener("online", () => void this.onOnline());
    window.addEventListener("offline", () => this.setStatus("offline"));

    await this.refresh();
    void this.flush();
    this.listen();
  }

  private async onOnline() {
    await this.flush();
    await this.refresh();
  }

  /** Full pull. Cheap at this scale (hundreds of rows) and always correct. */
  async refresh() {
    if (!supabase) return;
    if (!navigator.onLine) {
      this.setStatus("offline");
      return;
    }
    try {
      const [
        riders,
        groupItems,
        claims,
        personalItems,
        decisions,
        comments,
        logisticsFields,
        seenMarkers,
      ] = await Promise.all([
        supabase.from("riders").select("*").order("sort_order"),
        supabase.from("group_items").select("*").order("name"),
        supabase.from("claims").select("*"),
        supabase.from("personal_items").select("*").order("sort_order"),
        supabase.from("decisions").select("*").order("sort_order"),
        supabase.from("comments").select("*").order("created_at"),
        supabase.from("logistics_fields").select("*").order("sort_order"),
        supabase.from("seen_markers").select("*"),
      ]);
      const err =
        riders.error ||
        groupItems.error ||
        claims.error ||
        personalItems.error ||
        decisions.error ||
        comments.error ||
        logisticsFields.error ||
        seenMarkers.error;
      if (err) throw err;

      this.setSnap({
        riders: (riders.data ?? []) as DbRider[],
        groupItems: (groupItems.data ?? []) as GroupItem[],
        claims: (claims.data ?? []) as Claim[],
        personalItems: (personalItems.data ?? []) as PersonalItem[],
        decisions: (decisions.data ?? []) as Decision[],
        comments: (comments.data ?? []) as Comment[],
        logisticsFields: (logisticsFields.data ?? []) as LogisticsField[],
        seenMarkers: (seenMarkers.data ?? []) as SeenMarker[],
      });
      this.setStatus("ready");
    } catch {
      // A cached board is far more useful than an error screen in a hut.
      this.setStatus(this.snap.riders.length ? "offline" : "error");
    }
  }

  /** Live tile updates so the board moves while everyone packs. */
  private listen() {
    if (!supabase) return;
    supabase
      .channel("sjh-board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        () => void this.refresh(),
      )
      .subscribe();
  }

  // ---- writes -------------------------------------------------------
  private async queue(entry: Omit<OutboxEntry, "id" | "ts">) {
    this.outbox.push({ ...entry, id: crypto.randomUUID(), ts: Date.now() });
    await set(OUTBOX_KEY, this.outbox);
    this.emit();
    void this.flush();
  }

  private async flush() {
    if (!supabase || this.flushing || !navigator.onLine) return;
    if (this.outbox.length === 0) return;
    this.flushing = true;
    try {
      while (this.outbox.length) {
        const e = this.outbox[0];
        const q =
          e.op === "delete"
            ? supabase
                .from(e.table)
                .delete()
                .eq("id", e.payload.id as string)
            : supabase
                .from(e.table)
                .upsert(e.payload, { onConflict: CONFLICT_TARGET[e.table] });
        const { error } = await q;

        if (error) {
          // A row the server will never accept must not wedge the queue --
          // everything behind it would stop syncing forever. Retry a few
          // times to ride out transient failures, then drop it and move on.
          e.attempts = (e.attempts ?? 0) + 1;
          if (e.attempts < MAX_ATTEMPTS) throw error;
          console.warn("[sjh] dropping unsyncable change", e.table, error);
        }

        this.outbox.shift();
        await set(OUTBOX_KEY, this.outbox);
        this.emit();
      }
      this.setStatus("ready");
    } catch {
      // Keep the queue; it replays on the next online event.
      await set(OUTBOX_KEY, this.outbox);
      this.setStatus("offline");
    } finally {
      this.flushing = false;
    }
  }

  /** Apply a row change locally, then queue it for the server. */
  private write<K extends keyof Snapshot>(
    table: Table,
    row: Snapshot[K][number] & { id: string },
  ) {
    const field = TABLE_TO_FIELD[table] as K;
    const list = this.snap[field] as Array<{ id: string }>;
    const idx = list.findIndex((r) => r.id === row.id);
    const next = idx >= 0 ? list.with(idx, row) : [...list, row];
    this.setSnap({ ...this.snap, [field]: next });
    void this.queue({
      table,
      op: "upsert",
      payload: row as unknown as Record<string, unknown>,
    });
  }

  private remove(table: Table, id: string) {
    const field = TABLE_TO_FIELD[table];
    const list = this.snap[field] as Array<{ id: string }>;
    this.setSnap({
      ...this.snap,
      [field]: list.filter((r) => r.id !== id),
    } as Snapshot);
    void this.queue({ table, op: "delete", payload: { id } });
  }

  // ---- group items --------------------------------------------------

  /**
   * The one control that matters. Dropping to 0 moves the tile into Not
   * Required without deleting it or its claims -- the group deciding
   * against something is not the same as forbidding it, and anyone can
   * still choose to carry one.
   */
  setItemQty(id: string, qty: number, by: string | null) {
    const item = this.snap.groupItems.find((i) => i.id === id);
    if (!item) return;
    this.write<"groupItems">("group_items", {
      ...item,
      qty: Math.max(0, qty),
      last_changed_by: by,
      updated_at: new Date().toISOString(),
    });
  }

  updateItem(id: string, patch: Partial<GroupItem>, by: string | null) {
    const item = this.snap.groupItems.find((i) => i.id === id);
    if (!item) return;
    this.write<"groupItems">("group_items", {
      ...item,
      ...patch,
      last_changed_by: by,
      updated_at: new Date().toISOString(),
    });
  }

  addItem(
    fields: Pick<
      GroupItem,
      "name" | "category" | "qty" | "weight_oz" | "bulk"
    > &
      Partial<GroupItem>,
    by: string | null,
  ) {
    const now = new Date().toISOString();
    this.write<"groupItems">("group_items", {
      id: crypto.randomUUID(),
      bible_qty: null,
      source: "custom",
      minimalist: false,
      notes: null,
      ...fields,
      last_changed_by: by,
      created_at: now,
      updated_at: now,
    } as GroupItem);
  }

  deleteItem(id: string) {
    this.remove("group_items", id);
  }

  // ---- claims -------------------------------------------------------

  /** Claims are independent of the group total, so zeroed items stay claimable. */
  setClaim(itemId: string, riderId: string, qty: number) {
    const existing = this.snap.claims.find(
      (c) => c.group_item_id === itemId && c.rider_id === riderId,
    );
    if (qty <= 0) {
      if (existing) this.remove("claims", existing.id);
      return;
    }
    this.write<"claims">("claims", {
      id: existing?.id ?? crypto.randomUUID(),
      group_item_id: itemId,
      rider_id: riderId,
      qty,
      packed: existing?.packed ?? false,
      updated_at: new Date().toISOString(),
    });
  }

  togglePacked(itemId: string, riderId: string) {
    const c = this.snap.claims.find(
      (x) => x.group_item_id === itemId && x.rider_id === riderId,
    );
    if (!c) return;
    this.write<"claims">("claims", {
      ...c,
      packed: !c.packed,
      updated_at: new Date().toISOString(),
    });
  }

  // ---- personal kit -------------------------------------------------
  togglePersonal(id: string) {
    const p = this.snap.personalItems.find((x) => x.id === id);
    if (!p) return;
    this.write<"personalItems">("personal_items", {
      ...p,
      packed: !p.packed,
      updated_at: new Date().toISOString(),
    });
  }

  addPersonal(riderId: string, name: string, category: string) {
    this.write<"personalItems">("personal_items", {
      id: crypto.randomUUID(),
      rider_id: riderId,
      name,
      category,
      packed: false,
      official: false,
      sort_order: 900,
      notes: null,
      updated_at: new Date().toISOString(),
    });
  }

  deletePersonal(id: string) {
    this.remove("personal_items", id);
  }

  // ---- decisions ----------------------------------------------------

  /**
   * Resolving records the outcome, not just a status flag -- "we decided" is
   * useless three weeks later without "we decided what".
   */
  resolveDecision(id: string, outcome: string, by: string | null) {
    const d = this.snap.decisions.find((x) => x.id === id);
    if (!d) return;
    this.write<"decisions">("decisions", {
      ...d,
      status: "resolved",
      outcome,
      resolved_by: by,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  reopenDecision(id: string) {
    const d = this.snap.decisions.find((x) => x.id === id);
    if (!d) return;
    this.write<"decisions">("decisions", {
      ...d,
      status: "open",
      outcome: null,
      resolved_by: null,
      resolved_at: null,
      updated_at: new Date().toISOString(),
    });
  }

  updateDecision(id: string, patch: Partial<Decision>) {
    const d = this.snap.decisions.find((x) => x.id === id);
    if (!d) return;
    this.write<"decisions">("decisions", {
      ...d,
      ...patch,
      updated_at: new Date().toISOString(),
    });
  }

  addDecision(
    scope: "day" | "logistics",
    scopeId: string,
    title: string,
    by: string | null,
    detail?: string,
  ) {
    const now = new Date().toISOString();
    this.write<"decisions">("decisions", {
      id: crypto.randomUUID(),
      scope,
      scope_id: scopeId,
      title,
      detail: detail ?? null,
      status: "open",
      outcome: null,
      resolved_by: null,
      resolved_at: null,
      created_by: by,
      sort_order: 100,
      created_at: now,
      updated_at: now,
    });
  }

  deleteDecision(id: string) {
    this.remove("decisions", id);
  }

  // ---- comments -----------------------------------------------------
  addComment(
    scope: Scope,
    scopeId: string,
    riderId: string | null,
    body: string,
  ) {
    const now = new Date().toISOString();
    this.write<"comments">("comments", {
      id: crypto.randomUUID(),
      scope,
      scope_id: scopeId,
      rider_id: riderId,
      body,
      created_at: now,
      updated_at: now,
    });
  }

  deleteComment(id: string) {
    this.remove("comments", id);
  }

  // ---- logistics ----------------------------------------------------
  setLogisticsField(id: string, value: string, by: string | null) {
    const f = this.snap.logisticsFields.find((x) => x.id === id);
    if (!f) return;
    this.write<"logisticsFields">("logistics_fields", {
      ...f,
      value,
      updated_by: by,
      updated_at: new Date().toISOString(),
    });
  }

  // ---- read state ---------------------------------------------------

  /** Record that a rider has now looked at a day or logistics section. */
  markSeen(riderId: string, scope: "day" | "logistics", scopeId: string) {
    const existing = this.snap.seenMarkers.find(
      (m) => m.rider_id === riderId && m.scope === scope && m.scope_id === scopeId,
    );
    this.write<"seenMarkers">("seen_markers", {
      id: existing?.id ?? crypto.randomUUID(),
      rider_id: riderId,
      scope,
      scope_id: scopeId,
      seen_at: new Date().toISOString(),
    });
  }

  // ---- riders -------------------------------------------------------
  updateRider(id: string, patch: Partial<DbRider>) {
    const r = this.snap.riders.find((x) => x.id === id);
    if (!r) return;
    this.write<"riders">("riders", {
      ...r,
      ...patch,
      updated_at: new Date().toISOString(),
    });
  }
}

export const store = new Store();
