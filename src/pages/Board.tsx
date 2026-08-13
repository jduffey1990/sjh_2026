import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import ItemTile from "../components/ItemTile";
import LoadBalance from "../components/LoadBalance";
import SyncBadge from "../components/SyncBadge";
import {
  useBoard,
  useCompatibility,
  useSnapshot,
  store,
} from "../lib/useStore";
import { hasBackend } from "../lib/supabase";

type Filter = "all" | "gaps" | "mine" | "minimalist";

export default function Board() {
  const snap = useSnapshot();
  const { active, notRequired, categories, gaps, me } = useBoard();
  const warnings = useCompatibility();
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);

  // A small distance threshold keeps the grip from firing on a stray click.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;
    const riderId = String(over.id).replace(/^rider:/, "");
    const itemId = String(active.id);
    const existing = snap.claims.find(
      (c) => c.group_item_id === itemId && c.rider_id === riderId,
    );
    store.setClaim(itemId, riderId, (existing?.qty ?? 0) + 1);
  }

  const shown = useMemo(() => {
    switch (filter) {
      case "gaps":
        return gaps;
      case "mine":
        return active.filter((t) => t.mine);
      case "minimalist":
        return active.filter((t) => t.item.minimalist);
      default:
        return active;
    }
  }, [filter, active, gaps]);

  if (!hasBackend) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-ink-800 bg-ink-900/50 p-6 text-center">
        <h1 className="font-bold text-slate-100">
          Packing board not connected
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          The board needs a Supabase project. Add{" "}
          <code className="text-slate-300">VITE_SUPABASE_URL</code> and{" "}
          <code className="text-slate-300">VITE_SUPABASE_ANON_KEY</code> to{" "}
          <code className="text-slate-300">.env.local</code>, then run the SQL
          in <code className="text-slate-300">supabase/</code>.
        </p>
        <p className="mt-3 text-xs text-slate-600">
          Everything else on the site works without it.
        </p>
      </div>
    );
  }

  const totalNeeded = active.reduce((n, t) => n + t.item.qty, 0);
  const totalClaimed = active.reduce(
    (n, t) => n + Math.min(t.claimed, t.item.qty),
    0,
  );

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="space-y-5">
        <header className="topo overflow-hidden rounded-2xl border border-ink-800 p-6">
          <div className="flex flex-wrap items-start gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">
                Packing board
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-400">
                Group gear only. Claim what you're carrying; drop a count to
                zero and it moves to Not Required.
              </p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold tabular-nums text-slate-100">
                {totalClaimed}
                <span className="text-slate-600">/{totalNeeded}</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                items covered
              </div>
            </div>
          </div>

          <blockquote className="mt-5 border-l-2 border-aspen-500/50 pl-3 text-[12px] italic leading-relaxed text-slate-400">
            “Everyone in your group does not need all of these items but the
            group as a whole should have a good repair kit.”
            <span className="mt-0.5 block not-italic text-slate-600">
              — San Juan Huts, The Bikers' Bible
            </span>
          </blockquote>

          <div className="mt-4">
            <SyncBadge />
          </div>
        </header>

        {gaps.length > 0 && (
          <div className="rounded-2xl border border-rock-600/50 bg-rock-600/10 p-4">
            <h2 className="text-sm font-bold text-rock-400">
              {gaps.length} item{gaps.length === 1 ? "" : "s"} short
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-300">
              {gaps
                .slice(0, 6)
                .map((g) => g.item.name)
                .join(" · ")}
              {gaps.length > 6 && ` · +${gaps.length - 6} more`}
            </p>
          </div>
        )}

        {warnings.map((w) => (
          <div
            key={w.key}
            className="rounded-2xl border border-aspen-500/40 bg-aspen-500/[0.07] p-4"
          >
            <h2 className="text-sm font-bold text-aspen-400">⚠ {w.title}</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-300">
              {w.detail}
            </p>
            <p className="mt-2 border-l-2 border-ink-700 pl-2.5 text-[11px] italic text-slate-500">
              “{w.quote}”
            </p>
            {w.key === "unknown-specs" && (
              <Link
                to="/riders"
                className="mt-2 inline-block text-[11px] text-aspen-400 underline"
              >
                Fill in bike specs →
              </Link>
            )}
          </div>
        ))}

        <LoadBalance />

        {/* filters */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["all", `All ${active.length}`],
              ["gaps", `Short ${gaps.length}`],
              ["mine", "Mine"],
              ["minimalist", "Minimalist kit"],
            ] as [Filter, string][]
          ).map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                filter === f
                  ? "border-aspen-500/50 bg-aspen-500/15 text-aspen-300"
                  : "border-ink-800 text-slate-400 hover:border-ink-700",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setAdding((v) => !v)}
            className="ml-auto rounded-full border border-ink-700 px-3 py-1.5 text-[12px] font-medium text-slate-300 hover:border-aspen-500/50"
          >
            + Add item
          </button>
        </div>

        {filter === "minimalist" && (
          <p className="rounded-xl border border-ink-800 bg-ink-900/40 p-3 text-[11px] leading-relaxed text-slate-500">
            The Bible's alternate loadout: “for those of you who are handy with
            bikes and willing to accept a little more risk in order to go
            lighter.”
          </p>
        )}

        {adding && (
          <AddItem onDone={() => setAdding(false)} meId={me?.id ?? null} />
        )}

        {/* board */}
        {filter === "all" ? (
          categories.map((cat) => {
            const items = active.filter((t) => t.item.category === cat);
            return (
              <section key={cat}>
                <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {cat}
                </h2>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((t) => (
                    <ItemTile
                      key={t.item.id}
                      tile={t}
                      riders={snap.riders}
                      me={me}
                    />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((t) => (
              <ItemTile key={t.item.id} tile={t} riders={snap.riders} me={me} />
            ))}
            {shown.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-slate-500">
                Nothing here.
              </p>
            )}
          </div>
        )}

        {/* Not required -- always visible, still claimable */}
        {notRequired.length > 0 && (
          <section className="border-t border-ink-800 pt-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Not required — group brought these to zero
            </h2>
            <p className="mt-1 text-[11px] text-slate-600">
              Still bringable. Anyone who wants one can claim it, and it counts
              toward their load.
            </p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {notRequired.map((t) => (
                <ItemTile
                  key={t.item.id}
                  tile={t}
                  riders={snap.riders}
                  me={me}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </DndContext>
  );
}

function AddItem({
  onDone,
  meId,
}: {
  onDone: () => void;
  meId: string | null;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Camp");
  const [weight, setWeight] = useState("4");
  const [bulk, setBulk] = useState("1");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || !meId) return;
        store.addItem(
          {
            name: name.trim(),
            category: category.trim() || "Other",
            qty: 1,
            weight_oz: Number(weight) || 0,
            bulk: Math.min(4, Math.max(1, Number(bulk) || 1)),
          },
          meId,
        );
        onDone();
      }}
      className="grid gap-2 rounded-2xl border border-ink-800 bg-ink-900/60 p-4 sm:grid-cols-4"
    >
      <label className="text-[11px] text-slate-500 sm:col-span-2">
        Item
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mini chess board"
          className="mt-1 w-full rounded border border-ink-700 bg-ink-950 px-2 py-1.5 text-sm text-slate-200"
        />
      </label>
      <label className="text-[11px] text-slate-500">
        Category
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded border border-ink-700 bg-ink-950 px-2 py-1.5 text-sm text-slate-200"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-[11px] text-slate-500">
          oz
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 w-full rounded border border-ink-700 bg-ink-950 px-2 py-1.5 text-sm text-slate-200"
          />
        </label>
        <label className="text-[11px] text-slate-500">
          bulk
          <input
            type="number"
            min="1"
            max="4"
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            className="mt-1 w-full rounded border border-ink-700 bg-ink-950 px-2 py-1.5 text-sm text-slate-200"
          />
        </label>
      </div>
      <div className="flex gap-2 sm:col-span-4">
        <button
          type="submit"
          disabled={!meId}
          className="rounded-lg bg-aspen-500 px-4 py-2 text-sm font-bold text-ink-950 disabled:opacity-30"
        >
          Add to board
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-ink-700 px-4 py-2 text-sm text-slate-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
