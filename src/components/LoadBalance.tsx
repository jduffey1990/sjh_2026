import { Avatar } from './RiderPicker'
import { useLoads } from '../lib/useStore'

function fmt(oz: number) {
  return oz >= 16 ? `${(oz / 16).toFixed(1)} lb` : `${oz.toFixed(1)} oz`
}

export default function LoadBalance() {
  const { loads, avg, max, maxBulk } = useLoads()
  if (loads.length === 0) return null

  const sorted = [...loads].sort((a, b) => b.weightOz - a.weightOz)

  return (
    <section className="rounded-2xl border border-ink-800 bg-ink-900/50 p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-bold text-slate-100">Who's carrying what</h2>
        <span className="text-[11px] text-slate-500">
          avg {fmt(avg)} each
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        Group gear only — your own clothes don't count. Weight and bulk are
        tracked separately because a folding spare tire is light and enormous
        while a chain breaker is dense and pocket-sized.
      </p>

      <ul className="mt-4 space-y-2.5">
        {sorted.map((l) => (
          <li key={l.rider.id} className="flex items-center gap-2.5">
            <Avatar
              initials={l.rider.initials}
              color={l.rider.color}
              size="sm"
            />
            <span className="w-16 shrink-0 truncate text-[12px] text-slate-300">
              {l.rider.name.split(' ')[0]}
            </span>

            <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-800">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(l.weightOz / max) * 100}%`,
                  backgroundColor: l.rider.color,
                }}
              />
            </div>

            <span className="w-14 shrink-0 text-right text-[11px] tabular-nums text-slate-400">
              {l.weightOz > 0 ? fmt(l.weightOz) : '—'}
            </span>
            <span
              className="w-10 shrink-0 text-right text-[10px] tracking-tight text-slate-600"
              title={`Bulk score ${l.bulk}`}
            >
              {'●'.repeat(Math.min(4, Math.round((l.bulk / maxBulk) * 4)))}
              {'○'.repeat(
                4 - Math.min(4, Math.round((l.bulk / maxBulk) * 4)),
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
