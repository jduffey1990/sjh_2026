import { useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "../lib/useAuth";
import { signIn } from "../lib/supabase";

export default function AuthGate({ children }: { children: ReactNode }) {
  const state = useAuth();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // No backend configured: the static pages still work, so never block them.
  if (state === "no-backend" || state === "in") return <>{children}</>;

  if (state === "checking") {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-slate-600">
        …
      </div>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await signIn(pw);
    } catch {
      setErr("Not the right password.");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-sm">
        <div className="topo overflow-hidden rounded-2xl border border-ink-800 p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-rock-500 to-aspen-500 text-sm font-black text-ink-950">
              SJH
            </span>
            <div>
              <h1 className="font-bold text-slate-100">Telluride → Moab</h1>
              <p className="text-[11px] text-slate-500">Sep 26 – Oct 2, 2026</p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6">
            <label
              htmlFor="pw"
              className="text-[11px] uppercase tracking-wider text-slate-500"
            >
              Trip password
            </label>
            <input
              id="pw"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5 text-slate-100 outline-none focus:border-aspen-500/60"
            />
            {err && <p className="mt-2 text-[12px] text-rock-400">{err}</p>}
            <button
              type="submit"
              disabled={busy || !pw}
              className="tap-target mt-4 w-full rounded-lg bg-aspen-500 py-2.5 font-bold text-ink-950 disabled:opacity-40"
            >
              {busy ? "Checking…" : "Let me in"}
            </button>
          </form>
        </div>

        <p className="mt-4 px-2 text-center text-[11px] leading-relaxed text-slate-600">
          Signs in once and stays signed in. Do this before you leave — there is
          no signal to sign in with between Telluride and Gateway.
        </p>
      </div>
    </div>
  );
}
