import { BellRing, ChevronRight, WifiOff } from 'lucide-react'
import { ALERT_LABEL, type Alert } from '../lib/alerts'
import { formatAge } from '../lib/format'
import { zoneName } from '../lib/zones'
import type { Asset } from '../types'
import { Card, PanelHeader } from './ui/Card'
import { cn } from './ui/cn'

interface AlertsPanelProps {
  alerts: readonly Alert[]
  assets: readonly Asset[]
  selectedId: string | null
  onSelect: (id: string) => void
  now: Date
  className?: string
}

const KIND_ICON = { 'tag-offline': WifiOff } as const

export function AlertsPanel({ alerts, assets, selectedId, onSelect, now, className }: AlertsPanelProps) {
  return (
    <Card aria-labelledby="alerts-title" data-testid="alerts-panel" className={cn('flex min-h-0 flex-col', className)}>
      <PanelHeader
        id="alerts-title"
        title="Alerts"
        icon={<BellRing />}
        meta={
          <span
            data-testid="alerts-count"
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold tabular',
              alerts.length ? 'bg-sun-50 text-sun-700 ring-1 ring-sun-100 ring-inset' : 'bg-ink-100 text-ink-500',
            )}
          >
            {alerts.length} open
          </span>
        }
      />
      {alerts.length === 0 ? (
        <p className="px-5 pb-5 text-[13px] text-ink-500">All clear. Nothing needs attention.</p>
      ) : (
        <ul className="grid min-h-0 gap-2 overflow-y-auto px-3 pb-3 sm:grid-cols-2 3xl:grid-cols-1">
          {alerts.map((alert) => {
            const asset = assets.find((a) => a.id === alert.assetId)
            if (!asset) return null
            const Icon = KIND_ICON[alert.kind]
            const active = selectedId === asset.id
            return (
              <li key={alert.id}>
                <button
                  type="button"
                  data-testid="alert-item"
                  data-kind={alert.kind}
                  data-asset-id={asset.id}
                  onClick={() => onSelect(asset.id)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition',
                    active ? 'border-brand-200 bg-brand-50/70' : 'border-ink-150 bg-ink-25 hover:border-ink-200 hover:bg-white',
                  )}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sun-50 text-sun-600 ring-1 ring-sun-100 ring-inset">
                    <Icon aria-hidden="true" className="size-4" strokeWidth={2.1} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-semibold text-ink-900">{ALERT_LABEL[alert.kind]}</span>
                      <span className="text-xs whitespace-nowrap text-ink-500 tabular">{formatAge(alert.since, now)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-600">
                      {asset.name} <span className="font-mono text-ink-400">{asset.id}</span> · last seen in {zoneName(asset.zone)}
                    </span>
                  </span>
                  <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-ink-300 transition group-hover:text-ink-500" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
