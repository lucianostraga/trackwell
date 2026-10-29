import { TYPE_COLOR, TYPE_LABEL, TYPE_ORDER } from '../../lib/labels'
import { countByType } from '../../lib/filters'
import type { Asset, AssetType } from '../../types'
import { cn } from '../ui/cn'

interface MapLegendProps {
  assets: readonly Asset[]
  typeFilter: AssetType | 'all'
  onTypeFilter: (type: AssetType | 'all') => void
}

/** Color key for the dots. Clicking a type highlights only that type (same filter as the list). */
export function MapLegend({ assets, typeFilter, onTypeFilter }: MapLegendProps) {
  const counts = countByType(assets)
  return (
    <div data-testid="map-legend" className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 pt-3 pb-3.5">
      <ul className="flex flex-wrap items-center gap-x-1 gap-y-1" aria-label="Equipment types">
        {TYPE_ORDER.map((type) => {
          const active = typeFilter === type
          return (
            <li key={type}>
              <button
                type="button"
                data-testid="legend-type"
                data-type={type}
                aria-pressed={active}
                onClick={() => onTypeFilter(active ? 'all' : type)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[12.5px] transition',
                  active ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100',
                  typeFilter !== 'all' && !active && 'opacity-55',
                )}
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: TYPE_COLOR[type] }}
                />
                {TYPE_LABEL[type]}
                <span className={cn('tabular', active ? 'text-ink-300' : 'text-ink-400')}>{counts[type]}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** How maintenance and offline tags look on the map (shown inside the map frame). */
export function DotStyleKey() {
  return (
  <ul className="pointer-events-none absolute right-4 bottom-2.5 flex items-center gap-4 rounded-full bg-white/80 px-3 py-1 text-[12px] text-ink-500 ring-1 ring-ink-150 backdrop-blur" aria-label="Dot styles" data-testid="dot-style-key">
    <li className="flex items-center gap-1.5">
      <svg viewBox="-2 -2 4 4" className="size-3.5" aria-hidden="true">
        <circle r="0.85" fill="#fff" stroke="var(--color-ink-500)" strokeWidth="0.4" />
        <circle r="0.28" fill="var(--color-ink-500)" />
      </svg>
      In maintenance
    </li>
    <li className="flex items-center gap-1.5">
      <svg viewBox="-2 -2 4 4" className="size-4" aria-hidden="true">
        <circle r="1.45" fill="none" stroke="var(--color-ink-500)" strokeWidth="0.18" strokeDasharray="0.42 0.3" />
        <circle r="0.95" fill="var(--color-ink-500)" opacity="0.42" />
      </svg>
      Tag offline (last known spot)
    </li>
  </ul>
  )
}
