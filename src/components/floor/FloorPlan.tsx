import { ArrowRight, Maximize2, MousePointerClick } from 'lucide-react'
import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { FLOOR, ZONES } from '../../data/floor'
import { useElementWidth } from '../../hooks/useElementWidth'
import { formatRelativeTime } from '../../lib/format'
import { IDENTITY_VIEW, applyView, focusTransform } from '../../lib/geometry'
import { STATUS_LABEL, TYPE_COLOR, TYPE_LABEL } from '../../lib/labels'
import { isTagOffline } from '../../lib/tags'
import { countByZone, zoneName } from '../../lib/zones'
import type { Asset, AssetType } from '../../types'
import { Card } from '../ui/Card'
import { StatusPill, TypeTile } from '../ui/Badges'
import { cn } from '../ui/cn'
import { FloorPlanArt } from './FloorPlanArt'
import { DotStyleKey, MapLegend } from './MapLegend'

const ZOOM = 1.4
const DOT_R = 0.95

interface FloorPlanProps {
  assets: readonly Asset[]
  /** IDs that match the list filters; the others are dimmed. */
  matchingIds: ReadonlySet<string>
  filtered: boolean
  selectedId: string | null
  now: Date
  onSelect: (id: string | null) => void
  onOpen: (id: string) => void
  typeFilter: AssetType | 'all'
  onTypeFilter: (type: AssetType | 'all') => void
}

interface Hover {
  id: string
  x: number
  y: number
}

export function FloorPlan(props: FloorPlanProps) {
  const { assets, matchingIds, filtered, selectedId, now, onSelect, onOpen, typeFilter, onTypeFilter } = props
  const frameRef = useRef<HTMLDivElement>(null)
  const width = useElementWidth(frameRef)
  const [hover, setHover] = useState<Hover | null>(null)

  const selected = useMemo(() => assets.find((a) => a.id === selectedId) ?? null, [assets, selectedId])
  const view = selected ? focusTransform(selected.position, FLOOR, ZOOM) : IDENTITY_VIEW
  const pxPerMeter = width / FLOOR.width

  const zoneCounts = useMemo(
    () => countByZone(filtered ? assets.filter((a) => matchingIds.has(a.id)) : assets, ZONES),
    [assets, matchingIds, filtered],
  )

  const hovered = hover && hover.id !== selectedId ? assets.find((a) => a.id === hover.id) : undefined
  const callout = selected && width > 0 ? applyView(selected.position, view) : null

  const showHover = (asset: Asset, target: Element) => {
    const frame = frameRef.current?.getBoundingClientRect()
    const dot = target.getBoundingClientRect()
    if (!frame) return
    setHover({ id: asset.id, x: dot.left + dot.width / 2 - frame.left, y: dot.top - frame.top })
  }

  return (
    <Card aria-labelledby="floor-plan-title" data-testid="floor-plan" className="flex flex-col overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 pt-4 pb-3">
        <div>
          <h2 id="floor-plan-title" className="text-[17px] font-semibold tracking-tight text-ink-900">
            Live floor plan
          </h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-500">
            <MousePointerClick aria-hidden="true" className="size-3.5 text-ink-400" />
            Every dot is a piece of equipment. Point at one to see what it is, click it for details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {filtered && (
            <span
              data-testid="map-filter-note"
              className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100 ring-inset tabular"
            >
              Highlighting {matchingIds.size} of {assets.length}
            </span>
          )}
          {selected && (
            <button
              type="button"
              data-testid="map-reset"
              onClick={() => onSelect(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-150 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 shadow-card transition hover:bg-ink-50"
            >
              <Maximize2 aria-hidden="true" className="size-3.5" />
              Show whole floor
            </button>
          )}
        </div>
      </header>

      <div className="px-4">
        <div
          ref={frameRef}
          data-testid="map-frame"
          className="relative overflow-hidden rounded-xl border border-ink-150 bg-map-bg"
          onMouseLeave={() => setHover(null)}
        >
          <svg
            viewBox={`0 0 ${FLOOR.width} ${FLOOR.height}`}
            className="block h-auto w-full select-none"
            role="group"
            aria-label="Floor plan of Level 2 · Critical Care with every tracked asset"
            style={{ fontFamily: 'inherit' }}
          >
            <defs>
              <pattern id="map-grid" width="2" height="2" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.09" fill="var(--color-map-grid)" />
              </pattern>
              <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="0.9" />
              </filter>
            </defs>
            <rect width={FLOOR.width} height={FLOOR.height} fill="url(#map-grid)" onClick={() => onSelect(null)} />

            <g
              className="map-viewport"
              style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transformOrigin: '0 0' }}
            >
              <g onClick={() => onSelect(null)}>
                <FloorPlanArt zoneCounts={zoneCounts} filtered={filtered} />
              </g>
              {assets.map((asset, index) => (
                <AssetDot
                  key={asset.id}
                  asset={asset}
                  index={index}
                  now={now}
                  dimmed={filtered && !matchingIds.has(asset.id)}
                  faded={selected !== null && selected.id !== asset.id}
                  selected={selected?.id === asset.id}
                  hovered={hover?.id === asset.id}
                  onEnter={showHover}
                  onLeave={() => setHover(null)}
                  onOpen={onOpen}
                />
              ))}
            </g>
          </svg>

          <ScaleBar pxPerMeter={pxPerMeter * view.scale} />
          <DotStyleKey />

          {hovered && hover && <MapTooltip asset={hovered} x={hover.x} y={hover.y} now={now} />}

          {selected && callout && (
            <SelectionCallout
              key={selected.id}
              asset={selected}
              x={callout.x * pxPerMeter}
              y={callout.y * pxPerMeter - DOT_R * view.scale * pxPerMeter}
              onOpen={() => onOpen(selected.id)}
            />
          )}
        </div>
      </div>

      <MapLegend assets={assets} typeFilter={typeFilter} onTypeFilter={onTypeFilter} />
    </Card>
  )
}

interface AssetDotProps {
  asset: Asset
  index: number
  now: Date
  dimmed: boolean
  faded: boolean
  selected: boolean
  hovered: boolean
  onEnter: (asset: Asset, target: Element) => void
  onLeave: () => void
  onOpen: (id: string) => void
}

function AssetDot({ asset, index, now, dimmed, faded, selected, hovered, onEnter, onLeave, onOpen }: AssetDotProps) {
  const color = TYPE_COLOR[asset.type]
  const offline = isTagOffline(asset, now)
  const maintenance = asset.status === 'maintenance'
  // Purely visual: equipment being moved glides a few meters along the corridor and back.
  const drifting = !selected && asset.status === 'in-use' && asset.zone === 'nurses-station'
  const driftStyle = drifting
    ? ({ '--drift-x': `${asset.position.x < FLOOR.width / 2 ? 5 : -5}px`, '--drift-duration': `${14 + (index % 4) * 2}s` } as CSSProperties)
    : undefined
  const label = `${asset.name}, ${STATUS_LABEL[asset.status].toLowerCase()}, ${zoneName(asset.zone)}${offline ? ', tag offline' : ''}`

  return (
    <g
      className="asset-dot"
      data-testid="map-asset"
      data-asset-id={asset.id}
      data-type={asset.type}
      data-status={asset.status}
      data-offline={offline}
      data-selected={selected}
      data-dimmed={dimmed}
      data-hovered={hovered}
      transform={`translate(${asset.position.x} ${asset.position.y})`}
      opacity={dimmed ? 0.14 : faded ? 0.4 : 1}
      role="button"
      tabIndex={0}
      aria-label={label}
      onMouseEnter={(e) => onEnter(asset, e.currentTarget)}
      onMouseLeave={onLeave}
      onFocus={(e) => onEnter(asset, e.currentTarget)}
      onBlur={onLeave}
      onClick={(e) => {
        e.stopPropagation()
        onOpen(asset.id)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(asset.id)
        }
      }}
    >
      <g className={drifting ? 'asset-drift' : undefined} style={driftStyle}>
        {selected && (
          <>
            <circle r={2.4} fill={color} opacity={0.35} filter="url(#dot-glow)" />
            <circle r={1.3} fill="none" stroke={color} strokeWidth={0.3} className="selection-ring" />
            <circle r={1.75} fill="none" stroke="var(--color-ink-900)" strokeWidth={0.22} />
          </>
        )}
        {!offline && !dimmed && !faded && (
          <circle r={DOT_R} fill={color} className="pulse" style={{ animationDelay: `${-((index * 0.37) % 3.2)}s` }} />
        )}
        {offline && <circle r={1.45} fill="none" stroke="var(--color-ink-500)" strokeWidth={0.16} strokeDasharray="0.42 0.3" />}
        <g className="core">
          {maintenance ? (
            <>
              <circle r={DOT_R - 0.1} fill="#fff" stroke={color} strokeWidth={0.42} opacity={offline ? 0.55 : 1} />
              <circle r={0.3} fill={color} opacity={offline ? 0.55 : 1} />
            </>
          ) : (
            <circle r={DOT_R} fill={color} stroke="#fff" strokeWidth={0.3} opacity={offline ? 0.42 : 1} />
          )}
        </g>
        <circle r={2} fill="transparent" />
      </g>
    </g>
  )
}

function MapTooltip({ asset, x, y, now }: { asset: Asset; x: number; y: number; now: Date }) {
  const offline = isTagOffline(asset, now)
  const below = y < 150
  return (
    <div
      className="pointer-events-none absolute z-20 w-64"
      style={{
        left: x,
        top: y,
        transform: below ? 'translate(-50%, 34px)' : 'translate(-50%, calc(-100% - 10px))',
      }}
    >
      <div
        role="tooltip"
        data-testid="map-tooltip"
        className="animate-pop-in rounded-xl border border-ink-150 bg-white/95 p-3 shadow-pop backdrop-blur"
      >
      <div className="flex items-center gap-2.5">
        <TypeTile type={asset.type} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold text-ink-900" data-testid="tooltip-name">
            {asset.name}
          </p>
          <p className="font-mono text-[11px] text-ink-500">
            {asset.id} · {TYPE_LABEL[asset.type]}
          </p>
        </div>
      </div>
      <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t border-ink-100 pt-2.5 text-xs">
        <dt className="text-ink-500">Status</dt>
        <dd>
          <StatusPill status={asset.status} />
        </dd>
        <dt className="text-ink-500">Zone</dt>
        <dd className="font-medium text-ink-800" data-testid="tooltip-zone">
          {zoneName(asset.zone)}
        </dd>
        <dt className="text-ink-500">Last seen</dt>
        <dd className={cn('font-medium', offline ? 'text-bad-700' : 'text-ink-800')}>
          {formatRelativeTime(asset.lastSeenAt, now)}
          {offline && ' · tag offline'}
        </dd>
      </dl>
      </div>
    </div>
  )
}

function SelectionCallout({ asset, x, y, onOpen }: { asset: Asset; x: number; y: number; onOpen: () => void }) {
  return (
    <div className="absolute z-10" style={{ left: x, top: y, transform: 'translate(-50%, calc(-100% - 20px))' }}>
      <div data-testid="map-callout" className="relative animate-pop-in [animation-delay:450ms] [animation-fill-mode:both]">
      <div className="flex items-center gap-3 rounded-xl bg-ink-900 py-2 pr-2 pl-3 text-white shadow-pop">
        <span className="size-2.5 rounded-full ring-2 ring-white/30" style={{ backgroundColor: TYPE_COLOR[asset.type] }} />
        <span className="leading-tight">
          <span className="block text-[13px] font-semibold whitespace-nowrap">{asset.name}</span>
          <span className="block text-[11px] whitespace-nowrap text-ink-300">{zoneName(asset.zone)}</span>
        </span>
        <button
          type="button"
          data-testid="callout-details"
          onClick={onOpen}
          className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1.5 text-xs font-semibold whitespace-nowrap transition hover:bg-white/20"
        >
          Details
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </button>
      </div>
      <span aria-hidden="true" className="absolute left-1/2 -bottom-1.5 size-3 -translate-x-1/2 rotate-45 rounded-[2px] bg-ink-900" />
      </div>
    </div>
  )
}

/** "10 m" scale bar in the map's bottom-left corner. */
function ScaleBar({ pxPerMeter }: { pxPerMeter: number }) {
  if (!pxPerMeter) return null
  return (
    <div aria-hidden="true" className="pointer-events-none absolute bottom-3 left-4 flex items-end gap-2 text-[11px] font-medium text-ink-500">
      <span className="block h-1.5 border-x border-b border-ink-400" style={{ width: 10 * pxPerMeter }} />
      <span className="leading-none">10 m</span>
    </div>
  )
}
