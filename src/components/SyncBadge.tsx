import { useSyncState } from "../lib/useStore";

const COPY: Record<string, { dot: string; text: string }> = {
  loading: { dot: "bg-slate-500", text: "Loading…" },
  ready: { dot: "bg-sage-500", text: "Synced" },
  offline: { dot: "bg-aspen-500", text: "Offline" },
  error: { dot: "bg-rock-500", text: "Can't reach the server" },
  "no-backend": { dot: "bg-slate-600", text: "No backend configured" },
};

/**
 * Offline is a normal state on this trip, not an error -- there is no signal
 * on the plateau. Say so plainly and show what is still queued.
 */
export default function SyncBadge() {
  const { status, pending } = useSyncState();
  const c = COPY[status] ?? COPY.loading;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-ink-800 bg-ink-950/60 px-3 py-1.5 text-[11px]">
      <span className={`size-1.5 rounded-full ${c.dot}`} />
      <span className="text-slate-400">{c.text}</span>
      {pending > 0 && (
        <span className="text-aspen-400">
          · {pending} change{pending === 1 ? "" : "s"} queued
        </span>
      )}
      {status === "offline" && pending === 0 && (
        <span className="text-slate-600">· edits will sync later</span>
      )}
    </div>
  );
}
