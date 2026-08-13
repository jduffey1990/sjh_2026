import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SyncBadge from "../components/SyncBadge";
import RiderPicker from "../components/RiderPicker";
import { useDbRider, useSnapshot, store } from "../lib/useStore";
import { hasBackend } from "../lib/supabase";

function fmtOz(oz: number) {
  return oz >= 16 ? `${(oz / 16).toFixed(1)} lb` : `${oz.toFixed(1)} oz`;
}

export default function MyKit() {
  const snap = useSnapshot();
  const me = useDbRider();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const { byCategory, packed, total, groupGear, groupOz } = useMemo(() => {
    const mine = snap.personalItems
      .filter((p) => p.rider_id === me?.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const map = new Map<string, typeof mine>();
    for (const p of mine) {
      const list = map.get(p.category);
      if (list) list.push(p);
      else map.set(p.category, [p]);
    }

    // Group gear you claimed on the board belongs in your bag too, so it
    // belongs on your packing list. `claims.packed` is the same field the
    // board's "In my bag" toggles -- one source of truth, two views.
    const items = new Map(snap.groupItems.map((i) => [i.id, i]));
    const gear = snap.claims
      .filter((c) => c.rider_id === me?.id)
      .map((c) => ({ claim: c, item: items.get(c.group_item_id) }))
      .filter(
        (g): g is { claim: typeof g.claim; item: NonNullable<typeof g.item> } =>
          Boolean(g.item),
      )
      .sort((a, b) => a.item.name.localeCompare(b.item.name));

    return {
      byCategory: [...map.entries()],
      packed:
        mine.filter((p) => p.packed).length +
        gear.filter((g) => g.claim.packed).length,
      total: mine.length + gear.length,
      groupGear: gear,
      groupOz: gear.reduce(
        (n, g) => n + Number(g.item.weight_oz) * g.claim.qty,
        0,
      ),
    };
  }, [snap.personalItems, snap.claims, snap.groupItems, me]);

  if (!hasBackend) {
    return (
      <p className="py-16 text-center text-sm text-slate-500">
        Personal kit needs the Supabase connection — see the Packing board.
      </p>
    );
  }

  if (!me) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-bold text-slate-100">Who are you?</h1>
        <p className="mt-2 text-sm text-slate-400">
          Pick your name and this device will remember it.
        </p>
        <div className="mt-5 flex justify-center">
          <RiderPicker />
        </div>
      </div>
    );
  }

  const pct = total ? Math.round((packed / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="topo overflow-hidden rounded-2xl border border-ink-800 p-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-50">
          {me.name.split(" ")[0]}'s kit
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Everything going in your bag — your own kit, plus the group gear you
          claimed. Tick things off{" "}
          <em className="not-italic text-slate-300">
            as you physically pack them
          </em>
          ; claiming on the board is only a promise.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-800">
            <div
              className="h-full rounded-full bg-sage-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-bold tabular-nums text-slate-200">
            {packed}/{total}
          </span>
        </div>

        <div className="mt-4">
          <SyncBadge />
        </div>
      </header>

      <div className="rounded-xl border border-ink-800 bg-ink-900/40 p-3 text-[11px] leading-relaxed text-slate-500">
        This list is assembled from hut info and published trip reports, and
        weighted toward <strong className="text-slate-400">cold</strong> — the
        trip runs Sep 26 – Oct 2 with four days above 9,600 ft, past the season
        San Juan Huts advertises. Swap it for the Bible's own clothing list when
        the Route Packet arrives.
      </div>

      <section>
        <div className="mb-2 flex items-baseline gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Group gear you claimed
          </h2>
          {groupGear.length > 0 && (
            <span className="text-[11px] text-slate-600">
              {fmtOz(groupOz)} total
            </span>
          )}
          <Link
            to="/board"
            className="ml-auto text-[11px] text-slate-500 underline hover:text-slate-300"
          >
            board
          </Link>
        </div>

        {groupGear.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-800 p-3 text-center text-[12px] text-slate-600">
            You haven't claimed any group gear yet —{" "}
            <Link to="/board" className="text-aspen-500 underline">
              take something off the board
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-ink-800/70 overflow-hidden rounded-xl border border-aspen-500/30">
            {groupGear.map(({ claim, item }) => (
              <li key={claim.id}>
                <label className="flex cursor-pointer items-center gap-3 bg-aspen-500/[0.05] px-3.5 py-3 hover:bg-aspen-500/[0.09]">
                  <input
                    type="checkbox"
                    checked={claim.packed}
                    onChange={() => store.togglePacked(item.id, claim.rider_id)}
                    className="size-5 shrink-0 accent-sage-500"
                  />
                  <span
                    className={[
                      "flex-1 text-sm",
                      claim.packed
                        ? "text-slate-500 line-through"
                        : "text-slate-200",
                    ].join(" ")}
                  >
                    {item.name}
                    {claim.qty > 1 && (
                      <span className="ml-1.5 text-[11px] tabular-nums text-aspen-500">
                        ×{claim.qty}
                      </span>
                    )}
                    {item.qty === 0 && (
                      <span className="ml-1.5 text-[10px] uppercase tracking-wider text-slate-600">
                        not required
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-slate-600">
                    {fmtOz(Number(item.weight_oz) * claim.qty)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      {byCategory.map(([cat, items]) => (
        <section key={cat}>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {cat}
          </h2>
          <ul className="divide-y divide-ink-800/70 overflow-hidden rounded-xl border border-ink-800">
            {items.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-3 bg-ink-900/50 px-3.5 py-3 hover:bg-ink-900">
                  <input
                    type="checkbox"
                    checked={p.packed}
                    onChange={() => store.togglePersonal(p.id)}
                    className="size-5 shrink-0 accent-sage-500"
                  />
                  <span
                    className={[
                      "flex-1 text-sm",
                      p.packed
                        ? "text-slate-500 line-through"
                        : "text-slate-200",
                    ].join(" ")}
                  >
                    {p.name}
                  </span>
                  {!p.official && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        store.deletePersonal(p.id);
                      }}
                      className="text-slate-700 hover:text-rock-400"
                      aria-label={`Remove ${p.name}`}
                    >
                      ×
                    </button>
                  )}
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            store.addPersonal(me.id, name.trim(), "Other");
            setName("");
            setAdding(false);
          }}
          className="flex gap-2"
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Something else you're bringing"
            className="flex-1 rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-slate-200"
          />
          <button
            type="submit"
            className="rounded-lg bg-aspen-500 px-4 text-sm font-bold text-ink-950"
          >
            Add
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-lg border border-dashed border-ink-700 py-3 text-sm text-slate-500 hover:border-ink-600 hover:text-slate-300"
        >
          + Add something
        </button>
      )}
    </div>
  );
}
