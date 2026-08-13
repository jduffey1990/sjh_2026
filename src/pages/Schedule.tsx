import { Link } from "react-router-dom";
import { DAYS, TOTALS, TRIP, type TripDay } from "../data/trip";
import { useSnapshot } from "../lib/useStore";

const BASE = import.meta.env.BASE_URL;

function Stat({
  value,
  label,
  tone = "default",
}: {
  value: string;
  label: string;
  tone?: "default" | "warn";
}) {
  return (
    <div>
      <div
        className={[
          "text-lg font-bold tabular-nums leading-none",
          tone === "warn" ? "text-rock-400" : "text-slate-100",
        ].join(" ")}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
    </div>
  );
}

function DayCard({ d }: { d: TripDay }) {
  const snap = useSnapshot();
  const open = snap.decisions.filter(
    (x) => x.scope === "day" && x.scope_id === d.id && x.status === "open",
  ).length;
  const isTravel = d.kind === "travel";
  // Day 6 is the outlier: least mileage, most climbing of the week.
  const brutal = (d.gainFt ?? 0) >= 4000;

  return (
    <Link
      to={`/day/${d.id}`}
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-ink-900/60 transition-all",
        "hover:-translate-y-0.5 hover:border-ink-700 hover:bg-ink-900",
        isTravel ? "border-ink-800/60 border-dashed" : "border-ink-800",
      ].join(" ")}
    >
      <div className="flex items-start gap-3 p-4 pb-3">
        <div
          className={[
            "grid size-11 shrink-0 place-items-center rounded-xl text-sm font-black",
            isTravel
              ? "border border-dashed border-ink-700 text-slate-500"
              : "bg-gradient-to-br from-rock-500 to-aspen-500 text-ink-950",
          ].join(" ")}
        >
          {isTravel ? (d.id === "return" ? "⌂" : "→") : d.day}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-aspen-500">
              {d.weekday}
            </span>
            <span className="text-[11px] text-slate-500">{d.dateLabel}</span>
          </div>
          <h3 className="mt-0.5 truncate font-bold text-slate-100">
            {d.title}
          </h3>
        </div>
      </div>

      {d.profile && (
        <div className="mx-4 mb-3 overflow-hidden rounded-lg border border-ink-800 bg-white/95">
          <img
            src={`${BASE}profiles/${d.profile}`}
            alt={`Elevation profile, ${d.title}`}
            loading="lazy"
            className="h-20 w-full object-cover object-center"
          />
        </div>
      )}

      <p className="px-4 text-sm leading-relaxed text-slate-400">{d.summary}</p>

      <div className="mt-auto flex items-end gap-6 p-4 pt-4">
        {d.miles != null && <Stat value={`${d.miles}`} label="miles" />}
        {d.gainFt != null && (
          <Stat
            value={`${d.gainFt.toLocaleString()}′`}
            label="climbing"
            tone={brutal ? "warn" : "default"}
          />
        )}
        {d.highPointFt != null && (
          <Stat value={`${d.highPointFt.toLocaleString()}′`} label="high pt" />
        )}
      </div>

      {(d.flags.length > 0 || open > 0) && (
        <div className="space-y-1 border-t border-ink-800/70 bg-ink-950/40 px-4 py-2.5">
          {d.flags.length > 0 && (
            <span className="block text-[11px] leading-snug text-rock-400">
              ⚑ {d.flags[0]}
              {d.flags.length > 1 && (
                <span className="text-slate-600">
                  {" "}
                  +{d.flags.length - 1} more
                </span>
              )}
            </span>
          )}
          {open > 0 && (
            <span className="block text-[11px] leading-snug text-aspen-400">
              ● {open} decision{open === 1 ? "" : "s"} open
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

export default function Schedule() {
  return (
    <div>
      <section className="topo mb-8 overflow-hidden rounded-2xl border border-ink-800 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aspen-500">
          San Juan Huts · {TRIP.nights} nights
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-50 sm:text-4xl">
          Telluride → Moab
        </h1>
        <p className="mt-1 text-slate-400">
          Saturday Sep 26 – Friday Oct 2, 2026 · {TRIP.partySize} riders
        </p>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
          <Stat value={`${TOTALS.miles}`} label="total miles" />
          <Stat value={TOTALS.gainFt.toLocaleString()} label="feet climbed" />
          <Stat value={`${TRIP.huts.length}`} label="huts" />
          <Stat value="10,995′" label="high point" />
        </div>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-400">
          Six huts across the Uncompahgre Plateau, down through Unaweep Canyon
          and over the La Sals into the canyon country. Each hut sleeps eight —
          the group fills one exactly.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DAYS.map((d) => (
          <DayCard key={d.id} d={d} />
        ))}
      </div>

      <p className="mt-8 rounded-xl border border-ink-800/70 bg-ink-900/40 p-4 text-xs leading-relaxed text-slate-500">
        <strong className="text-slate-400">On these numbers:</strong> San Juan
        Huts publishes only “~30 miles per day.” The per-day mileage and
        elevation here come from a published rider trip report and should be
        treated as close-but-unofficial. The Route Packet emailed with the
        reservation is authoritative — when it lands, the figures live in one
        file and take a minute to correct.
      </p>
    </div>
  );
}
