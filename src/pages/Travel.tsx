import { useEffect, useMemo, useRef, useState } from "react";
import { LOGISTICS } from "../data/travel";
import { TRIP } from "../data/trip";
import Decisions from "../components/Decisions";
import Comments from "../components/Comments";
import SyncBadge from "../components/SyncBadge";
import { hasBackend } from "../lib/supabase";
import { useSnapshot, useDbRider, useUnread, store } from "../lib/useStore";
import type { LogisticsField } from "../lib/types";

/** An editable label/value pair. Anyone can fill one in; everyone sees it. */
function Field({ f }: { f: LogisticsField }) {
  const snap = useSnapshot();
  const me = useDbRider();
  const by = f.updated_by
    ? snap.riders.find((r) => r.id === f.updated_by)
    : null;
  const unset = !f.value || /TBD/i.test(f.value);

  return (
    <div className="bg-ink-900/70 px-5 py-3">
      <dt className="text-[10px] uppercase tracking-wider text-slate-500">
        {f.label}
      </dt>
      <dd>
        <input
          defaultValue={f.value ?? ""}
          placeholder={me ? "—" : "pick your name to edit"}
          disabled={!me}
          onBlur={(e) => {
            const v = e.target.value.trim();
            // Never write an unattributed edit -- `me` is briefly null while
            // the roster loads, and a value with no author is worse than none.
            if (me && v !== (f.value ?? "")) {
              store.setLogisticsField(f.id, v, me.id);
            }
          }}
          className={[
            "mt-0.5 w-full rounded border border-transparent bg-transparent px-1 py-0.5 -mx-1 text-sm",
            "hover:border-ink-700 focus:border-aspen-500/50 focus:bg-ink-950 focus:outline-none",
            unset ? "text-aspen-500/80" : "text-slate-200",
          ].join(" ")}
        />
        {by && (
          <span className="mt-0.5 block text-[10px] text-slate-600">
            {by.name.split(" ")[0]} ·{" "}
            {new Date(f.updated_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </dd>
    </div>
  );
}

export default function Travel() {
  const snap = useSnapshot();
  const me = useDbRider();
  const unread = useUnread();

  // Every section is visible at once here, so opening the page counts as
  // seeing all of them. Freeze the counts first so the badges survive the
  // render that clears them.
  const [arrived, setArrived] = useState<Map<string, number>>(new Map());
  const marked = useRef(false);

  useEffect(() => {
    if (!me || marked.current) return;
    marked.current = true;
    const frozen = new Map<string, number>();
    for (const s of LOGISTICS) {
      const u = unread.get(`logistics::${s.id}`);
      if (u?.total) frozen.set(s.id, u.total);
      if (me) store.markSeen(me.id, "logistics", s.id);
    }
    setArrived(frozen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  // Section status is derived from unresolved decisions, not hard-coded.
  const openBySection = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of snap.decisions) {
      if (d.scope !== "logistics" || d.status !== "open") continue;
      m.set(d.scope_id, (m.get(d.scope_id) ?? 0) + 1);
    }
    return m;
  }, [snap.decisions]);

  const totalOpen = [...openBySection.values()].reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="topo overflow-hidden rounded-2xl border border-ink-800 p-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">
          Travel & logistics
        </h1>
        <p className="mt-2 text-slate-400">
          Everything that is not riding.{" "}
          {hasBackend && totalOpen > 0 && (
            <span className="text-aspen-400">
              {totalOpen} decision{totalOpen === 1 ? "" : "s"} still open.
            </span>
          )}
        </p>
        {hasBackend && (
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            Every value below is editable — book the lodge, type it in, and
            everyone has it.
          </p>
        )}
        {hasBackend && (
          <div className="mt-4">
            <SyncBadge />
          </div>
        )}
      </header>

      <div className="mt-6 space-y-4">
        {LOGISTICS.map((s) => {
          const fields = snap.logisticsFields
            .filter((f) => f.section_id === s.id)
            .sort((a, b) => a.sort_order - b.sort_order);
          const open = openBySection.get(s.id) ?? 0;

          return (
            <section
              key={s.id}
              className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/50"
            >
              <div className="flex flex-wrap items-center gap-3 border-b border-ink-800/70 px-5 py-3.5">
                <h2 className="font-bold text-slate-100">{s.title}</h2>
                <span className="ml-auto flex items-center gap-2">
                  {arrived.get(s.id) ? (
                    <span className="rounded-full bg-aspen-500/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-aspen-300">
                      {arrived.get(s.id)} new
                    </span>
                  ) : null}
                  {open > 0 && (
                    <span className="rounded-full border border-aspen-500/50 bg-aspen-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-aspen-400">
                      {open} open
                    </span>
                  )}
                </span>
              </div>

              <div className="space-y-3 px-5 py-4">
                {s.body.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-slate-300">
                    {p}
                  </p>
                ))}
              </div>

              {/* Live, editable values. Falls back to the static list when
                  there is no backend configured. */}
              {fields.length > 0 ? (
                <dl className="grid gap-px border-t border-ink-800/70 bg-ink-800/40 sm:grid-cols-2">
                  {fields.map((f) => (
                    <Field key={f.id} f={f} />
                  ))}
                </dl>
              ) : (
                s.items && (
                  <dl className="grid gap-px border-t border-ink-800/70 bg-ink-800/40 sm:grid-cols-2">
                    {s.items.map((it) => (
                      <div key={it.label} className="bg-ink-900/70 px-5 py-3">
                        <dt className="text-[10px] uppercase tracking-wider text-slate-500">
                          {it.label}
                        </dt>
                        <dd className="mt-0.5 text-sm text-slate-200">
                          {it.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )
              )}

              {hasBackend && (
                <div className="space-y-4 border-t border-ink-800/70 p-5">
                  <Decisions scope="logistics" scopeId={s.id} />
                  <div>
                    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Notes
                    </h3>
                    <Comments scope="logistics" scopeId={s.id} compact />
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-slate-600">
        Operator: {TRIP.operator.name} ·{" "}
        <a href={`tel:${TRIP.operator.phone}`} className="underline">
          {TRIP.operator.phone}
        </a>
      </p>
    </div>
  );
}
