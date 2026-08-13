import { useMemo, useState } from "react";
import { Avatar } from "./RiderPicker";
import { useSnapshot, useDbRider, store } from "../lib/useStore";
import type { Scope } from "../lib/types";

function ago(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function Comments({
  scope,
  scopeId,
  placeholder = "Add a note…",
  compact = false,
}: {
  scope: Scope;
  scopeId: string;
  placeholder?: string;
  compact?: boolean;
}) {
  const snap = useSnapshot();
  const me = useDbRider();
  const [body, setBody] = useState("");

  const thread = useMemo(
    () =>
      snap.comments
        .filter((c) => c.scope === scope && c.scope_id === scopeId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [snap.comments, scope, scopeId],
  );

  const riderById = (id: string | null) =>
    id ? (snap.riders.find((r) => r.id === id) ?? null) : null;

  return (
    <div className={compact ? "" : "mt-4"}>
      {thread.length > 0 && (
        <ul className="space-y-2.5">
          {thread.map((c) => {
            const r = riderById(c.rider_id);
            return (
              <li key={c.id} className="flex gap-2.5">
                {r ? (
                  <Avatar initials={r.initials} color={r.color} size="sm" />
                ) : (
                  <span className="size-5 shrink-0 rounded-full bg-ink-700" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[12px] font-semibold text-slate-300">
                      {r ? r.name.split(" ")[0] : "Someone"}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {ago(c.created_at)}
                    </span>
                    {me && c.rider_id === me.id && (
                      <button
                        onClick={() => store.deleteComment(c.id)}
                        className="ml-auto text-[10px] text-slate-700 hover:text-rock-400"
                      >
                        delete
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-300">
                    {c.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = body.trim();
          if (!text) return;
          store.addComment(scope, scopeId, me?.id ?? null, text);
          setBody("");
        }}
        className={thread.length > 0 ? "mt-3 flex gap-2" : "flex gap-2"}
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={me ? placeholder : "Pick your name up top to comment"}
          disabled={!me}
          className="min-w-0 flex-1 rounded-lg border border-ink-800 bg-ink-950 px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-700 focus:border-ink-600 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!me || !body.trim()}
          className="shrink-0 rounded-lg border border-ink-700 px-3 text-[13px] text-slate-300 disabled:opacity-30"
        >
          Post
        </button>
      </form>
    </div>
  );
}
