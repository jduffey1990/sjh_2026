export default function Stepper({
  value,
  onChange,
  min = 0,
  label,
  tone = 'default',
  disabled,
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  label: string
  tone?: 'default' | 'mine'
  disabled?: boolean
}) {
  const btn =
    'tap-target grid place-items-center px-2.5 text-lg leading-none select-none ' +
    'text-slate-400 hover:text-slate-100 disabled:opacity-25 disabled:hover:text-slate-400'

  return (
    <div className="flex items-center gap-2">
      <span className="w-[5.5rem] shrink-0 text-[11px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <div
        className={[
          'flex items-center rounded-lg border',
          tone === 'mine'
            ? 'border-aspen-500/40 bg-aspen-500/10'
            : 'border-ink-700 bg-ink-950/50',
        ].join(' ')}
      >
        <button
          type="button"
          className={btn}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={disabled || value <= min}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span
          className={[
            'w-8 text-center text-sm font-bold tabular-nums',
            tone === 'mine' ? 'text-aspen-300' : 'text-slate-100',
          ].join(' ')}
        >
          {value}
        </span>
        <button
          type="button"
          className={btn}
          onClick={() => onChange(value + 1)}
          disabled={disabled}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
