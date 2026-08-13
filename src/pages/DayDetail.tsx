import { Link, useParams } from 'react-router-dom'
import { DAYS } from '../data/trip'

const BASE = import.meta.env.BASE_URL

export default function DayDetail() {
  const { id } = useParams()
  const idx = DAYS.findIndex((d) => d.id === id)
  const d = DAYS[idx]

  if (!d) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-400">No such day.</p>
        <Link to="/" className="mt-3 inline-block text-aspen-400 underline">
          Back to schedule
        </Link>
      </div>
    )
  }

  const prev = DAYS[idx - 1]
  const next = DAYS[idx + 1]

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300"
      >
        ← Schedule
      </Link>

      <header className="topo mt-4 overflow-hidden rounded-2xl border border-ink-800 p-6">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aspen-500">
            {d.kind === 'travel' ? 'Travel day' : `Day ${d.day}`}
          </span>
          <span className="text-[11px] text-slate-500">
            {d.weekday} {d.dateLabel}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">
          {d.title}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {d.from} → {d.to}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
          {d.miles != null && (
            <div>
              <div className="text-xl font-bold tabular-nums text-slate-100">
                {d.miles}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                miles
              </div>
            </div>
          )}
          {d.gainFt != null && (
            <div>
              <div
                className={[
                  'text-xl font-bold tabular-nums',
                  d.gainFt >= 4000 ? 'text-rock-400' : 'text-slate-100',
                ].join(' ')}
              >
                {d.gainFt.toLocaleString()}′
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                climbing
              </div>
            </div>
          )}
          {d.highPointFt != null && (
            <div>
              <div className="text-xl font-bold tabular-nums text-slate-100">
                {d.highPointFt.toLocaleString()}′
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                high point
              </div>
            </div>
          )}
        </div>
      </header>

      {d.profile && (
        <figure className="mt-6 overflow-hidden rounded-2xl border border-ink-800 bg-white">
          <img
            src={`${BASE}profiles/${d.profile}`}
            alt={`Elevation profile for ${d.title}`}
            className="w-full"
          />
          <figcaption className="bg-ink-900 px-4 py-2 text-[11px] text-slate-500">
            Elevation profile · San Juan Huts
          </figcaption>
        </figure>
      )}

      <section className="mt-6 space-y-4">
        {d.detail.map((p, i) => (
          <p key={i} className="leading-relaxed text-slate-300">
            {p}
          </p>
        ))}
      </section>

      {d.alternates.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Route options
          </h2>
          <ul className="mt-3 space-y-2">
            {d.alternates.map((a, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl border border-ink-800 bg-ink-900/50 p-3.5 text-sm leading-relaxed text-slate-300"
              >
                <span className="text-sage-400">⟋</span>
                {a}
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.flags.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-rock-400">
            Needs attention
          </h2>
          <ul className="mt-3 space-y-2">
            {d.flags.map((f, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl border border-rock-600/40 bg-rock-600/10 p-3.5 text-sm leading-relaxed text-slate-200"
              >
                <span className="text-rock-400">⚑</span>
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="mt-10 flex gap-3 border-t border-ink-800 pt-5 text-sm">
        {prev ? (
          <Link
            to={`/day/${prev.id}`}
            className="flex-1 rounded-xl border border-ink-800 p-3 hover:border-ink-700"
          >
            <span className="block text-[11px] text-slate-500">← Previous</span>
            <span className="block truncate text-slate-300">{prev.title}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link
            to={`/day/${next.id}`}
            className="flex-1 rounded-xl border border-ink-800 p-3 text-right hover:border-ink-700"
          >
            <span className="block text-[11px] text-slate-500">Next →</span>
            <span className="block truncate text-slate-300">{next.title}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </article>
  )
}
