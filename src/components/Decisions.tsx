import { useMemo, useState } from "react";
import { Avatar } from "./RiderPicker";
import Comments from "./Comments";
import { useSnapshot, useDbRider, store } from "../lib/useStore";
import type { Decision } from "../lib/types";

function DecisionCard({ d }: { d: Decision }) {
  const snap = useSnapshot();
  const me = useDbRider();
  const [open, setOpen] = useState(d.status === "open");
  const [outcome, setOutcome] = useState("");

  const resolver = d.resolved_by
    ? snap.riders.find((r) => r.id === d.resolved_by)
    : null;
  const replies = snap.comments.filter(
    (c) => c.scope === "decision" && c.scope_id === d.id,
  ).length;

  const resolved = d.status === "resolved";

  return (
    <div
      className={[
        "rounded-xl border",
        resolved
          ? "border-sage-500/40 bg-sage-500/[0.06]"
          : "border-aspen-500/40 bg-aspen-500/[0.06]",
      ].join(" ")}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-3.5 text-left"
      >
        <span
          className={[
            "mt-0.5 shrink-0 text-xs",
            resolved ? "text-sage-400" : "text-aspen-400",
          ].join(" ")}
        >
          {resolved ? "✓" : "●"}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-bold text-slate-100">{d.title}</h3>
          {resolved ? (
            <p className="mt-0.5 text-[12px] text-sage-400">{d.outcome}</p>
          ) : (
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-aspen-500">
              Open
            </p>
          )}
        </div>
        {replies > 0 && (
          <span className="shrink-0 text-[11px] text-slate-600">
            {replies} 💬
          </span>
        )}
      </button>

      {open && (
        <div className="space-y-3 border-t border-ink-800/60 p-3.5">
          {d.detail && (
            <p className="text-[12px] leading-relaxed text-slate-400">
              {d.detail}
            </p>
          )}

          {resolved ? (
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              {resolver && (
                <>
                  <Avatar
                    initials={resolver.initials}
                    color={resolver.color}
                    size="sm"
                  />
                  <span>
                    {resolver.name.split(" ")[0]} settled this
                    {d.resolved_at &&
                      ` · ${new Date(d.resolved_at).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}`}
                  </span>
                </>
              )}
              <button
                onClick={() => store.reopenDecision(d.id)}
                className="ml-auto underline hover:text-slate-300"
              >
                reopen
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const text = outcome.trim();
                if (!text) return;
                store.resolveDecision(d.id, text, me?.id ?? null);
                setOutcome("");
              }}
              className="flex gap-2"
            >
              <input
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="What did we decide?"
                className="min-w-0 flex-1 rounded-lg border border-ink-800 bg-ink-950 px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-700 focus:border-ink-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!outcome.trim()}
                className="shrink-0 rounded-lg bg-sage-500/90 px-3 text-[13px] font-bold text-ink-950 disabled:opacity-30"
              >
                Resolve
              </button>
            </form>
          )}

          <div className="border-t border-ink-800/60 pt-3">
            <Comments
              scope="decision"
              scopeId={d.id}
              placeholder="Weigh in…"
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Decisions({
  scope,
  scopeId,
}: {
  scope: "day" | "logistics";
  scopeId: string;
}) {
  const snap = useSnapshot();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const list = useMemo(
    () =>
      snap.decisions
        .filter((d) => d.scope === scope && d.scope_id === scopeId)
        .sort(
          (a, b) =>
            Number(a.status === "resolved") - Number(b.status === "resolved") ||
            a.sort_order - b.sort_order,
        ),
    [snap.decisions, scope, scopeId],
  );

  const open = list.filter((d) => d.status === "open").length;

  return (
    <section>
      <div className="mb-2 flex items-baseline gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Decisions
        </h2>
        {open > 0 && (
          <span className="text-[11px] text-aspen-500">{open} open</span>
        )}
        <button
          onClick={() => setAdding((v) => !v)}
          className="ml-auto text-[11px] text-slate-500 underline hover:text-slate-300"
        >
          {adding ? "cancel" : "+ add"}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const t = title.trim();
            if (!t) return;
            store.addDecision(scope, scopeId, t);
            setTitle("");
            setAdding(false);
          }}
          className="mb-2 flex gap-2"
        >
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Something we need to settle…"
            className="min-w-0 flex-1 rounded-lg border border-ink-800 bg-ink-950 px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-700 focus:border-ink-600 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-aspen-500 px-3 text-[13px] font-bold text-ink-950"
          >
            Add
          </button>
        </form>
      )}

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-800 p-3 text-center text-[12px] text-slate-600">
          Nothing to settle here.
        </p>
      ) : (
        <div className="space-y-2">
          {list.map((d) => (
            <DecisionCard key={d.id} d={d} />
          ))}
        </div>
      )}
    </section>
  );
}
