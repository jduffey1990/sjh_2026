import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { TRIP } from "../data/trip";
import { useRider } from "../lib/useRider";
import RiderPicker from "./RiderPicker";

const NAV = [
  { to: "/", label: "Schedule", icon: "▤", end: true },
  { to: "/board", label: "Packing", icon: "☰" },
  { to: "/kit", label: "My kit", icon: "✓" },
  { to: "/travel", label: "Travel", icon: "⛰" },
  { to: "/riders", label: "Riders", icon: "◍" },
  { to: "/gallery", label: "Photos", icon: "◲" },
];

function daysOut(): number {
  const start = new Date(`${TRIP.startDate}T00:00:00`);
  const now = new Date();
  return Math.ceil((start.getTime() - now.getTime()) / 86_400_000);
}

export default function Layout() {
  const { pathname } = useLocation();
  const { rider } = useRider();

  // Route changes should start at the top, not wherever the last page was.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const out = daysOut();

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-30 border-b border-ink-800/80 bg-ink-950/85 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 py-3">
            <NavLink to="/" className="group flex items-center gap-3 min-w-0">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-rock-500 to-aspen-500 text-sm font-black text-ink-950">
                SJH
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold tracking-wide text-slate-100">
                  {TRIP.route}
                </span>
                <span className="block truncate text-[11px] text-slate-500">
                  Sep 26 – Oct 2, 2026
                </span>
              </span>
            </NavLink>

            <div className="ml-auto flex items-center gap-3">
              {out > 0 && (
                <span className="hidden sm:inline-flex items-baseline gap-1.5 rounded-full border border-ink-800 bg-ink-900/60 px-3 py-1">
                  <span className="text-sm font-bold tabular-nums text-aspen-400">
                    {out}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500">
                    days out
                  </span>
                </span>
              )}
              <RiderPicker />
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1 -mb-px">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  [
                    "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-rock-500 text-slate-100"
                      : "border-transparent text-slate-400 hover:text-slate-200",
                  ].join(" ")
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:pb-10">
        <Outlet />
      </main>

      <footer className="hidden md:block border-t border-ink-800/60 px-4 py-6 text-center text-xs text-slate-600">
        Route info and photos courtesy of{" "}
        <a
          href={TRIP.operator.url}
          target="_blank"
          rel="noreferrer"
          className="text-slate-500 underline underline-offset-2 hover:text-slate-300"
        >
          San Juan Huts
        </a>
        {rider && <> · packing as {rider.name}</>}
      </footer>

      {/* Mobile bottom nav -- thumb reach, since this lives on a phone. */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-ink-800 bg-ink-950/95 backdrop-blur-md md:hidden pb-[env(safe-area-inset-bottom)]">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              [
                "tap-target flex flex-col items-center justify-center gap-0.5 py-2 text-[10px]",
                isActive ? "text-aspen-400" : "text-slate-500",
              ].join(" ")
            }
          >
            <span className="text-base leading-none">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
