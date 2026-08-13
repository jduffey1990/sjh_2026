import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Avatar } from "./RiderPicker";
import Stepper from "./Stepper";
import { store, type TileView } from "../lib/useStore";
import type { DbRider } from "../lib/types";

const STATE_STYLE: Record<string, string> = {
  needed: "border-rock-600/60 bg-rock-600/[0.07]",
  partial: "border-aspen-500/40 bg-aspen-500/[0.06]",
  claimed: "border-sage-500/40 bg-sage-500/[0.06]",
  packed: "border-sage-500/60 bg-sage-500/[0.12]",
  "not-required": "border-dashed border-ink-700 bg-ink-900/30",
};

const STATE_LABEL: Record<string, string> = {
  needed: "Nobody bringing",
  partial: "Short",
  claimed: "Covered",
  packed: "Covered · all packed",
  "not-required": "Not required",
};

function fmtOz(oz: number) {
  if (oz === 0) return "—";
  return oz >= 16 ? `${(oz / 16).toFixed(1)} lb` : `${oz.toFixed(1)} oz`;
}

function fmtWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ItemTile({
  tile,
  riders,
  me,
}: {
  tile: TileView;
  riders: DbRider[];
  me: DbRider | null;
}) {
  const { item, claims, claimed, state, mine } = tile;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  // Desktop only: the grip is hidden under `pointer: coarse`, so on a phone
  // this never competes with scrolling. Tapping is the primary path there.
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
  });

  const riderById = (id: string) => riders.find((r) => r.id === id);
  const pct = item.qty > 0 ? Math.min(100, (claimed / item.qty) * 100) : 0;
  const deviates = item.bible_qty != null && item.bible_qty !== item.qty;
  const changedBy = item.last_changed_by
    ? riderById(item.last_changed_by)
    : null;

  return (
    <div
      ref={setNodeRef}
      className={[
        "rounded-xl border transition-colors",
        STATE_STYLE[state],
        isDragging ? "opacity-40" : "",
      ].join(" ")}
    >
      {/* --- header ---------------------------------------------------- */}
      {/* The grip sits outside the disclosure button so a drag never also
          registers as a click that expands the tile. */}
      <div className="flex items-start">
        <span
          {...listeners}
          {...attributes}
          title="Drag onto a rider to assign"
          className="hidden shrink-0 cursor-grab py-3.5 pl-3 text-slate-700 hover:text-slate-400 active:cursor-grabbing pointer-fine:block"
        >
          ⠿
        </span>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-start gap-3 p-3.5 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={[
                  "truncate font-semibold",
                  state === "not-required"
                    ? "text-slate-400"
                    : "text-slate-100",
                ].join(" ")}
              >
                {item.name}
              </h3>
              {item.source === "custom" && (
                <span className="shrink-0 rounded border border-ink-700 px-1.5 py-px text-[9px] uppercase tracking-wider text-slate-500">
                  added
                </span>
              )}
              {item.source === "trip-report" && (
                <span className="shrink-0 rounded border border-ink-700 px-1.5 py-px text-[9px] uppercase tracking-wider text-slate-500">
                  unofficial
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px]">
              <span
                className={
                  state === "needed"
                    ? "font-semibold text-rock-400"
                    : state === "partial"
                      ? "font-semibold text-aspen-400"
                      : state === "not-required"
                        ? "text-slate-500"
                        : "text-sage-400"
                }
              >
                {STATE_LABEL[state]}
              </span>
              {item.qty > 0 && (
                <span className="tabular-nums text-slate-500">
                  {claimed} / {item.qty}
                </span>
              )}
              <span className="text-slate-600">
                {fmtOz(Number(item.weight_oz))}
              </span>
            </div>
          </div>

          {/* claimant avatars */}
          <div className="flex shrink-0 -space-x-1.5">
            {claims.slice(0, 4).map((c) => {
              const r = riderById(c.rider_id);
              return r ? (
                <span key={c.id} title={`${r.name} · ${c.qty}`}>
                  <Avatar
                    initials={r.initials}
                    color={r.color}
                    size="sm"
                    dim={!c.packed && state === "packed"}
                  />
                </span>
              ) : null;
            })}
            {claims.length > 4 && (
              <span className="grid size-5 place-items-center rounded-full bg-ink-700 text-[9px] font-bold text-slate-300">
                +{claims.length - 4}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* --- progress -------------------------------------------------- */}
      {item.qty > 0 && (
        <div className="mx-3.5 h-1 overflow-hidden rounded-full bg-ink-800">
          <div
            className={[
              "h-full rounded-full transition-all",
              state === "packed" || state === "claimed"
                ? "bg-sage-500"
                : "bg-aspen-500",
            ].join(" ")}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* --- quick claim -------------------------------------------------
          Claiming is a commitment, not a packing action. Ticking something as
          physically in a bag happens on My Kit, where you are standing over
          the bag -- keeping both on this tile made them feel like one step. */}
      {!open && me && (
        <div className="flex items-center gap-2 p-3 pt-2.5">
          {mine ? (
            <>
              <span className="flex-1 truncate text-[12px] text-slate-400">
                You're bringing {mine.qty}
                {mine.packed ? (
                  <span className="text-sage-400"> · packed ✓</span>
                ) : (
                  <span className="text-slate-600"> · not packed yet</span>
                )}
              </span>
              <button
                onClick={() => store.setClaim(item.id, me.id, 0)}
                className="tap-target shrink-0 rounded-lg border border-ink-700 px-3 text-sm text-slate-400 hover:border-rock-600/60 hover:text-rock-400"
              >
                Drop
              </button>
            </>
          ) : (
            <button
              onClick={() => store.setClaim(item.id, me.id, 1)}
              className="tap-target w-full rounded-lg border border-ink-700 px-3 text-sm font-medium text-slate-300 hover:border-aspen-500/50 hover:text-aspen-300"
            >
              {item.qty === 0 ? "I'll bring one anyway" : "I'll bring this"}
            </button>
          )}
        </div>
      )}

      {/* --- expanded -------------------------------------------------- */}
      {open && (
        <div className="space-y-3 border-t border-ink-800/70 p-3.5">
          {item.notes && (
            <p className="rounded-lg bg-ink-950/40 p-2.5 text-[12px] leading-relaxed text-slate-400">
              {item.source === "bible" && (
                <span className="text-slate-500">Bikers' Bible: </span>
              )}
              {item.notes}
            </p>
          )}

          <Stepper
            label="group brings"
            value={item.qty}
            disabled={!me}
            onChange={(n) => me && store.setItemQty(item.id, n, me.id)}
          />

          {me ? (
            <Stepper
              label="i'm bringing"
              tone="mine"
              value={mine?.qty ?? 0}
              onChange={(n) => store.setClaim(item.id, me.id, n)}
            />
          ) : (
            <p className="text-[11px] text-slate-500">
              Pick your name up top to claim this.
            </p>
          )}

          {/* who has what */}
          {claims.length > 0 && (
            <ul className="space-y-1">
              {claims.map((c) => {
                const r = riderById(c.rider_id);
                if (!r) return null;
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-2 text-[12px]"
                  >
                    <Avatar initials={r.initials} color={r.color} size="sm" />
                    <span className="text-slate-300">{r.name}</span>
                    <span className="tabular-nums text-slate-500">
                      ×{c.qty}
                    </span>
                    {c.packed && (
                      <span className="text-sage-400">✓ packed</span>
                    )}
                    <button
                      onClick={() => store.setClaim(item.id, r.id, 0)}
                      className="ml-auto text-slate-600 hover:text-rock-400"
                      title={`Release ${r.name}'s claim`}
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* provenance */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-ink-800/70 pt-2.5 text-[11px] text-slate-600">
            {item.bible_qty != null && (
              <span className={deviates ? "text-aspen-500/80" : ""}>
                Bible said {item.bible_qty}
              </span>
            )}
            <span>
              bulk {"●".repeat(item.bulk)}
              {"○".repeat(4 - item.bulk)}
            </span>
            {changedBy && (
              <span>
                {changedBy.name.split(" ")[0]} set {item.qty} ·{" "}
                {fmtWhen(item.updated_at)}
              </span>
            )}
            <button
              onClick={() => setEditing((v) => !v)}
              className="ml-auto underline hover:text-slate-400"
            >
              {editing ? "done" : "edit"}
            </button>
          </div>

          {editing && (
            <div className="grid gap-2 rounded-lg bg-ink-950/50 p-2.5 sm:grid-cols-2">
              <label className="text-[11px] text-slate-500">
                Name
                <input
                  defaultValue={item.name}
                  onBlur={(e) =>
                    store.updateItem(
                      item.id,
                      { name: e.target.value },
                      me?.id ?? null,
                    )
                  }
                  className="mt-1 w-full rounded border border-ink-700 bg-ink-950 px-2 py-1.5 text-sm text-slate-200"
                />
              </label>
              <label className="text-[11px] text-slate-500">
                Category
                <input
                  defaultValue={item.category}
                  onBlur={(e) =>
                    store.updateItem(
                      item.id,
                      { category: e.target.value },
                      me?.id ?? null,
                    )
                  }
                  className="mt-1 w-full rounded border border-ink-700 bg-ink-950 px-2 py-1.5 text-sm text-slate-200"
                />
              </label>
              <label className="text-[11px] text-slate-500">
                Weight (oz)
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={Number(item.weight_oz)}
                  onBlur={(e) =>
                    store.updateItem(
                      item.id,
                      { weight_oz: Number(e.target.value) },
                      me?.id ?? null,
                    )
                  }
                  className="mt-1 w-full rounded border border-ink-700 bg-ink-950 px-2 py-1.5 text-sm text-slate-200"
                />
              </label>
              <label className="text-[11px] text-slate-500">
                Bulk (1–4)
                <input
                  type="number"
                  min="1"
                  max="4"
                  defaultValue={item.bulk}
                  onBlur={(e) =>
                    store.updateItem(
                      item.id,
                      {
                        bulk: Math.min(4, Math.max(1, Number(e.target.value))),
                      },
                      me?.id ?? null,
                    )
                  }
                  className="mt-1 w-full rounded border border-ink-700 bg-ink-950 px-2 py-1.5 text-sm text-slate-200"
                />
              </label>
              {item.source === "custom" && (
                <button
                  onClick={() => store.deleteItem(item.id)}
                  className="col-span-full text-left text-[11px] text-rock-400 hover:underline"
                >
                  Delete this item entirely
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
