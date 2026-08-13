import type { ReactNode } from "react";
import { useRider } from "../lib/useRider";
import { Avatar } from "./RiderPicker";
import { hasBackend } from "../lib/supabase";

/**
 * Everything written to the trip is attributed -- resolutions, comments,
 * claims, quantity changes and logistics edits all record who did it. That
 * only works if we know who you are before you can touch anything, so pick a
 * name once per device.
 *
 * Not security: the password gate is what keeps strangers out. This is so
 * "Kyle set 2" is never "somebody set 2".
 */
export default function IdentityGate({ children }: { children: ReactNode }) {
  const { rider, setRider, riders } = useRider();

  // With no backend nothing is written, so there is nothing to attribute.
  if (!hasBackend || rider) return <>{children}</>;

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-md">
        <div className="topo overflow-hidden rounded-2xl border border-ink-800 p-6">
          <h1 className="text-xl font-black tracking-tight text-slate-50">
            Who are you?
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            Everything you change gets your name on it — what you're carrying,
            what you decided, what you booked.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {riders.map((r) => (
              <button
                key={r.name}
                onClick={() => setRider(r)}
                className="tap-target flex items-center gap-2.5 rounded-xl border border-ink-800 bg-ink-900/60 px-3 py-2.5 text-left transition-colors hover:border-aspen-500/50 hover:bg-ink-900"
              >
                <Avatar initials={r.initials} color={r.color} />
                <span className="truncate text-sm text-slate-200">
                  {r.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 px-2 text-center text-[11px] leading-relaxed text-slate-600">
          Remembered on this device. Change it any time from the menu in the top
          right.
        </p>
      </div>
    </div>
  );
}
