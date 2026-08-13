import { LOGISTICS } from '../data/travel'
import { TRIP } from '../data/trip'

const STATUS: Record<
  string,
  { label: string; className: string }
> = {
  open: {
    label: 'Needs deciding',
    className: 'border-rock-600/50 bg-rock-600/15 text-rock-400',
  },
  settled: {
    label: 'Settled',
    className: 'border-sage-500/40 bg-sage-500/10 text-sage-400',
  },
  info: {
    label: 'Good to know',
    className: 'border-ink-700 bg-ink-800/60 text-slate-400',
  },
}

export default function Travel() {
  const open = LOGISTICS.filter((s) => s.status === 'open').length

  return (
    <div className="mx-auto max-w-3xl">
      <header className="topo overflow-hidden rounded-2xl border border-ink-800 p-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">
          Travel & logistics
        </h1>
        <p className="mt-2 text-slate-400">
          Everything that is not riding. {open > 0 && (
            <span className="text-rock-400">
              {open} item{open === 1 ? '' : 's'} still need a group decision.
            </span>
          )}
        </p>
      </header>

      <div className="mt-6 space-y-4">
        {LOGISTICS.map((s) => {
          const st = STATUS[s.status]
          return (
            <section
              key={s.id}
              className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/50"
            >
              <div className="flex flex-wrap items-center gap-3 border-b border-ink-800/70 px-5 py-3.5">
                <h2 className="font-bold text-slate-100">{s.title}</h2>
                <span
                  className={`ml-auto rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${st.className}`}
                >
                  {st.label}
                </span>
              </div>

              <div className="space-y-3 px-5 py-4">
                {s.body.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-slate-300">
                    {p}
                  </p>
                ))}
              </div>

              {s.items && (
                <dl className="grid gap-px border-t border-ink-800/70 bg-ink-800/40 sm:grid-cols-2">
                  {s.items.map((it) => (
                    <div key={it.label} className="bg-ink-900/70 px-5 py-3">
                      <dt className="text-[10px] uppercase tracking-wider text-slate-500">
                        {it.label}
                      </dt>
                      <dd className="mt-0.5 text-sm text-slate-200">{it.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          )
        })}
      </div>

      <p className="mt-8 text-center text-xs text-slate-600">
        Operator: {TRIP.operator.name} ·{' '}
        <a href={`tel:${TRIP.operator.phone}`} className="underline">
          {TRIP.operator.phone}
        </a>
      </p>
    </div>
  )
}
