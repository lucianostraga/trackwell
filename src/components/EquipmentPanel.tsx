import { ArrowRight, Boxes, Search, WifiOff, X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { countByStatus, countByType, filterAssets, hasActiveFilters, NO_FILTERS, type AssetFilters } from '../lib/filters'
import { formatRelativeTime } from '../lib/format'
import { STATUS_LABEL, STATUS_ORDER, TYPE_COLOR, TYPE_SHORT, TYPE_ORDER } from '../lib/labels'
import { isTagOffline } from '../lib/tags'
import { zoneName } from '../lib/zones'
import type { Asset, AssetStatus } from '../types'
import { StatusPill, TypeTile } from './ui/Badges'
import { Card } from './ui/Card'
import { cn } from './ui/cn'

interface EquipmentPanelProps {
  assets: readonly Asset[]
  /** Assets matching the filters, in list order. */
  visible: readonly Asset[]
  filters: AssetFilters
  onFiltersChange: (filters: AssetFilters) => void
  selectedId: string | null
  onSelect: (id: string | null) => void
  onOpen: (id: string) => void
  now: Date
  className?: string
}

const TABS: ReadonlyArray<AssetStatus | 'all'> = ['all', ...STATUS_ORDER]
const TAB_LABEL: Record<AssetStatus | 'all', string> = { all: 'All', ...STATUS_LABEL, maintenance: 'Maintenance' }

export function EquipmentPanel(props: EquipmentPanelProps) {
  const { assets, visible, filters, onFiltersChange, selectedId, onSelect, onOpen, now, className } = props
  // Tab counts follow the search and type filter, so they always add up to what the list can show.
  const statusCounts = countByStatus(filterAssets(assets, { ...filters, status: 'all' }))
  const typeCounts = countByType(assets)
  const listRef = useRef<HTMLUListElement>(null)

  // Keep the selected row in view when it is selected from the map or an alert.
  useEffect(() => {
    if (!selectedId) return
    const row = listRef.current?.querySelector<HTMLElement>(`[data-asset-id="${selectedId}"]`)
    row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedId])

  const set = (patch: Partial<AssetFilters>) => onFiltersChange({ ...filters, ...patch })

  return (
    <Card aria-labelledby="equipment-title" data-testid="equipment-panel" className={cn('flex min-h-0 flex-col', className)}>
      <header className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="equipment-title" className="flex items-center gap-2 text-[15px] font-semibold text-ink-900">
            <Boxes aria-hidden="true" className="size-4 text-ink-400" />
            Equipment
          </h2>
          <span className="text-[13px] text-ink-500 tabular" data-testid="equipment-summary">
            {visible.length === assets.length ? `${assets.length} assets` : `${visible.length} of ${assets.length}`}
          </span>
        </div>
        <label className="relative mt-3 block">
          <span className="sr-only">Search equipment</span>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            aria-label="Search equipment"
            placeholder="Search by name or ID, e.g. VT-03"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            className="h-10 w-full rounded-lg border border-ink-200 bg-white pr-9 pl-9 text-[13.5px] text-ink-900 shadow-card transition outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 [&::-webkit-search-cancel-button]:hidden"
          />
          {filters.query !== '' && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => set({ query: '' })}
              className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Equipment type">
          <Chip active={filters.type === 'all'} onClick={() => set({ type: 'all' })} testId="type-chip-all">
            All types
          </Chip>
          {TYPE_ORDER.map((type) => (
            <Chip
              key={type}
              active={filters.type === type}
              onClick={() => set({ type: filters.type === type ? 'all' : type })}
              testId={`type-chip-${type}`}
            >
              <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: TYPE_COLOR[type] }} />
              {TYPE_SHORT[type]}
              <span className="text-ink-400 tabular">{typeCounts[type]}</span>
            </Chip>
          ))}
        </div>
      </header>

      <div role="tablist" aria-label="Status" className="flex gap-0.5 border-b border-ink-150 px-3">
        {TABS.map((tab) => {
          const active = filters.status === tab
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`status-tab-${tab}`}
              onClick={() => set({ status: tab })}
              className={cn(
                'relative flex items-center gap-1.5 px-2 pt-1 pb-2.5 text-[13px] font-medium whitespace-nowrap transition',
                active ? 'text-ink-900' : 'text-ink-500 hover:text-ink-800',
              )}
            >
              {TAB_LABEL[tab]}
              <span
                data-testid="status-tab-count"
                className={cn(
                  'rounded-full px-1.5 text-[11px] leading-[18px] tabular',
                  active ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500',
                )}
              >
                {statusCounts[tab]}
              </span>
              {active && <span aria-hidden="true" className="absolute inset-x-1.5 -bottom-px h-0.5 rounded-full bg-brand-600" />}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className="grid flex-1 place-items-center px-6 py-10 text-center">
          <div>
            <p className="text-sm font-medium text-ink-800">No equipment matches</p>
            <button
              type="button"
              onClick={() => onFiltersChange(NO_FILTERS)}
              className="mt-2 text-[13px] font-medium text-brand-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <ul ref={listRef} className="min-h-0 flex-1 divide-y divide-ink-100 overflow-y-auto" data-testid="equipment-list">
          {visible.map((asset) => (
            <EquipmentRow
              key={asset.id}
              asset={asset}
              now={now}
              selected={asset.id === selectedId}
              onSelect={() => onSelect(asset.id === selectedId ? null : asset.id)}
              onOpen={() => onOpen(asset.id)}
            />
          ))}
        </ul>
      )}

      {hasActiveFilters(filters) && visible.length > 0 && (
        <footer className="flex items-center justify-between border-t border-ink-150 px-5 py-2.5 text-xs text-ink-500">
          <span className="tabular">
            Showing {visible.length} of {assets.length}
          </span>
          <button type="button" onClick={() => onFiltersChange(NO_FILTERS)} className="font-medium text-brand-600 hover:underline">
            Clear filters
          </button>
        </footer>
      )}
    </Card>
  )
}

function Chip({ active, onClick, children, testId }: { active: boolean; onClick: () => void; children: ReactNode; testId: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      data-testid={testId}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ring-1 transition ring-inset',
        active ? 'bg-ink-900 text-white ring-ink-900 [&_.text-ink-400]:text-ink-300' : 'bg-white text-ink-600 ring-ink-200 hover:bg-ink-50',
      )}
    >
      {children}
    </button>
  )
}

function EquipmentRow({ asset, now, selected, onSelect, onOpen }: { asset: Asset; now: Date; selected: boolean; onSelect: () => void; onOpen: () => void }) {
  const offline = isTagOffline(asset, now)
  return (
    <li
      data-testid="equipment-row"
      data-asset-id={asset.id}
      data-status={asset.status}
      data-type={asset.type}
      data-selected={selected}
      className={cn('relative transition-colors', selected ? 'bg-brand-50/70' : 'hover:bg-ink-25')}
    >
      {selected && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-brand-500" />}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`Show ${asset.name} on the map`}
        className="flex w-full items-center gap-3 px-5 py-3 text-left"
      >
        <TypeTile type={asset.type} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="truncate text-[13.5px] font-semibold text-ink-900">{asset.name}</span>
            <span className="font-mono text-[11.5px] text-ink-500">{asset.id}</span>
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
            <span className="truncate">{zoneName(asset.zone)}</span>
            <span aria-hidden="true" className="text-ink-300">
              ·
            </span>
            {offline ? (
              <span className="inline-flex shrink-0 items-center gap-1 font-medium text-bad-700">
                <WifiOff aria-hidden="true" className="size-3" />
                {formatRelativeTime(asset.lastSeenAt, now)}
              </span>
            ) : (
              <span className="shrink-0">seen {formatRelativeTime(asset.lastSeenAt, now)}</span>
            )}
          </span>
        </span>
        <StatusPill status={asset.status} />
      </button>
      {selected && (
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pl-[68px] text-xs text-ink-600">
          <span>Highlighted on the floor plan</span>
          <button
            type="button"
            data-testid="row-details"
            onClick={onOpen}
            className="inline-flex items-center gap-1 rounded-lg bg-ink-900 px-2.5 py-1.5 font-semibold text-white shadow-sm transition hover:bg-ink-800"
          >
            View details
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      )}
    </li>
  )
}
