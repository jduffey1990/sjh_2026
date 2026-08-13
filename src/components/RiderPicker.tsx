import { useEffect, useRef, useState } from "react";
import { useRider } from "../lib/useRider";

export function Avatar({
  initials,
  color,
  size = "md",
  dim = false,
}: {
  initials: string;
  color: string;
  size?: "sm" | "md";
  dim?: boolean;
}) {
  return (
    <span
      className={[
        "grid shrink-0 place-items-center rounded-full font-bold text-ink-950",
        size === "sm" ? "size-5 text-[9px]" : "size-7 text-[11px]",
        dim ? "opacity-40" : "",
      ].join(" ")}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export default function RiderPicker() {
  const { rider, setRider, riders } = useRider();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="tap-target flex items-center gap-2 rounded-full border border-ink-800 bg-ink-900/60 py-1 pl-1 pr-3 text-sm transition-colors hover:border-ink-700"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {rider ? (
          <>
            <Avatar initials={rider.initials} color={rider.color} />
            <span className="hidden sm:inline text-slate-300">
              {rider.name.split(" ")[0]}
            </span>
          </>
        ) : (
          <>
            <span className="grid size-7 place-items-center rounded-full border border-dashed border-slate-600 text-slate-500">
              ?
            </span>
            <span className="text-slate-400">Who are you?</span>
          </>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-ink-800 bg-ink-900 shadow-2xl shadow-black/50"
        >
          <p className="border-b border-ink-800 px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500">
            Who are you?
          </p>
          {riders.map((r) => (
            <button
              key={r.name}
              role="option"
              aria-selected={rider?.name === r.name}
              onClick={() => {
                setRider(r);
                setOpen(false);
              }}
              className={[
                "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-ink-800",
                rider?.name === r.name
                  ? "bg-ink-850 text-slate-100"
                  : "text-slate-300",
              ].join(" ")}
            >
              <Avatar initials={r.initials} color={r.color} />
              {r.name}
              {rider?.name === r.name && (
                <span className="ml-auto text-aspen-400">✓</span>
              )}
            </button>
          ))}
          {rider && (
            <button
              onClick={() => {
                setRider(null);
                setOpen(false);
              }}
              className="w-full border-t border-ink-800 px-3 py-2 text-left text-xs text-slate-500 hover:bg-ink-800 hover:text-slate-300"
            >
              Sign out of this device
            </button>
          )}
        </div>
      )}
    </div>
  );
}
