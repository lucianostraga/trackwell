import { useId, useState } from 'react'

interface SparklineProps {
  values: readonly number[]
  /** One label per value, e.g. "Oct 22" ... "Today". */
  labels: readonly string[]
  format: (value: number) => string
  ariaLabel: string
  width?: number
  height?: number
}

/**
 * Seven-day trend: history in a recessive ink line, the current value in brand blue.
 * Hovering shows the value for each day.
 */
export function Sparkline({ values, labels, format, ariaLabel, width = 116, height = 40 }: SparklineProps) {
  const gradientId = useId()
  const [hover, setHover] = useState<number | null>(null)
  if (values.length < 2) return null

  const pad = 4
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const step = (width - pad * 2) / (values.length - 1)
  const points = values.map((v, i) => ({
    x: pad + i * step,
    y: pad + (1 - (v - min) / span) * (height - pad * 2),
  }))
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${line} L${points[points.length - 1]!.x.toFixed(1)},${height} L${points[0]!.x.toFixed(1)},${height} Z`
  const last = points[points.length - 1]!
  const prev = points[points.length - 2]!
  const active = hover === null ? null : points[hover]

  return (
    <div className="relative" onMouseLeave={() => setHover(null)}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke="var(--color-ink-300)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={`M${prev.x.toFixed(1)},${prev.y.toFixed(1)} L${last.x.toFixed(1)},${last.y.toFixed(1)}`}
          fill="none"
          stroke="var(--color-brand-500)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {active && (
          <line x1={active.x} x2={active.x} y1={0} y2={height} stroke="var(--color-ink-200)" strokeDasharray="2 2" />
        )}
        <circle
          cx={(active ?? last).x}
          cy={(active ?? last).y}
          r="3.5"
          fill={hover === null || hover === values.length - 1 ? 'var(--color-brand-500)' : 'var(--color-ink-500)'}
          stroke="#fff"
          strokeWidth="2"
        />
        {points.map((p, i) => (
          <rect
            key={i}
            x={p.x - step / 2}
            y={0}
            width={step}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      {hover !== null && active && (
        <div
          className="pointer-events-none absolute -top-9 z-10 -translate-x-1/2 rounded-md bg-ink-900 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow-raised"
          style={{ left: active.x }}
        >
          <span className="text-ink-300">{labels[hover]}</span> <span className="tabular">{format(values[hover]!)}</span>
        </div>
      )}
    </div>
  )
}
