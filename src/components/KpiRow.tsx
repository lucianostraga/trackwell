import { Activity, ArrowDownRight, ArrowUpRight, CircleCheck, MapPin, Minus, WifiOff, Wrench, type LucideIcon } from 'lucide-react'
import { KPI_HISTORY } from '../data/kpi-history'
import { DAY, formatDate } from '../lib/format'
import { compareToBaseline, type FleetKpis, type KpiTrend } from '../lib/kpis'
import { OFFLINE_AFTER_MINUTES } from '../lib/tags'
import { Sparkline } from './Sparkline'
import { cn } from './ui/cn'

const TONE = {
  brand: 'bg-brand-50 text-brand-600 ring-brand-100',
  good: 'bg-good-50 text-good-700 ring-good-100',
  sun: 'bg-sun-50 text-sun-600 ring-sun-100',
  ink: 'bg-ink-100 text-ink-600 ring-ink-150',
} as const

const SENTIMENT_STYLE = {
  positive: 'bg-good-50 text-good-700 ring-good-100',
  negative: 'bg-bad-50 text-bad-700 ring-bad-100',
  neutral: 'bg-ink-100 text-ink-600 ring-ink-150',
} as const

interface KpiCardProps {
  id: string
  label: string
  icon: LucideIcon
  tone: keyof typeof TONE
  value: number
  trend: KpiTrend
  context: string
  history: readonly number[]
  labels: readonly string[]
}

function KpiCard({ id, label, icon: Icon, tone, value, trend, context, history, labels }: KpiCardProps) {
  const TrendIcon = trend.direction === 'up' ? ArrowUpRight : trend.direction === 'down' ? ArrowDownRight : Minus
  const delta = trend.delta === 0 ? '0' : `${trend.delta > 0 ? '+' : '−'}${Math.abs(trend.delta)}`
  return (
    <article
      data-testid={`kpi-${id}`}
      aria-labelledby={`kpi-${id}-label`}
      className="rounded-xl border border-ink-150 bg-white px-5 pt-4 pb-3.5 shadow-card transition-shadow duration-200 hover:shadow-raised"
    >
      <div className="flex items-center gap-2.5">
        <span className={cn('grid size-7 place-items-center rounded-lg ring-1 ring-inset', TONE[tone])}>
          <Icon aria-hidden="true" className="size-[15px]" strokeWidth={2.1} />
        </span>
        <h3 id={`kpi-${id}-label`} className="text-[13.5px] font-medium text-ink-600">
          {label}
        </h3>
      </div>
      <div className="mt-2.5 flex items-end justify-between gap-3">
        <p data-testid="kpi-value" className="text-[32px] leading-none font-semibold tracking-tight text-ink-900 tabular">
          {value}
        </p>
        <Sparkline
          values={[...history, value]}
          labels={labels}
          format={(v) => String(v)}
          ariaLabel={`${label}, last 8 days`}
          width={96}
          height={34}
        />
      </div>
      {/* One line when the card is wide enough, two lines on narrower screens. */}
      <div className="@container mt-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] whitespace-nowrap">
        <span
          data-testid="kpi-delta"
          className={cn(
            'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1 ring-inset tabular',
            SENTIMENT_STYLE[trend.sentiment],
          )}
        >
          <TrendIcon aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
          {delta}
        </span>
        <span className="text-ink-500">vs last week</span>
        <span aria-hidden="true" className="text-ink-300 @max-[18.5rem]:hidden">
          ·
        </span>
        <span className="min-w-0 truncate text-ink-500 @max-[18.5rem]:basis-full" data-testid="kpi-context">
          {context}
        </span>
      </div>
      </div>
    </article>
  )
}

export function KpiRow({ kpis, now }: { kpis: FleetKpis; now: Date }) {
  const days = KPI_HISTORY.tracked.length
  const labels = Array.from({ length: days + 1 }, (_, i) =>
    i === days ? 'Today' : formatDate(new Date(now.getTime() - (days - i) * DAY).toISOString()),
  )
  const share = kpis.inUseShare === null ? '—' : `${Math.round(kpis.inUseShare)}%`

  const cards: KpiCardProps[] = [
    {
      id: 'tracked',
      label: 'Equipment tracked',
      icon: MapPin,
      tone: 'brand',
      value: kpis.tracked,
      trend: compareToBaseline(kpis.tracked, KPI_HISTORY.tracked[0], 'up'),
      context: `in ${kpis.zonesCovered} zones`,
      history: KPI_HISTORY.tracked,
      labels,
    },
    {
      id: 'in-use',
      label: 'In use',
      icon: Activity,
      tone: 'brand',
      value: kpis.inUse,
      trend: compareToBaseline(kpis.inUse, KPI_HISTORY.inUse[0], 'neither'),
      context: `${share} of the fleet`,
      history: KPI_HISTORY.inUse,
      labels,
    },
    {
      id: 'available',
      label: 'Available',
      icon: CircleCheck,
      tone: 'good',
      value: kpis.available,
      trend: compareToBaseline(kpis.available, KPI_HISTORY.available[0], 'neither'),
      context: 'ready to use',
      history: KPI_HISTORY.available,
      labels,
    },
    {
      id: 'maintenance',
      label: 'In maintenance',
      icon: Wrench,
      tone: 'sun',
      value: kpis.maintenance,
      trend: compareToBaseline(kpis.maintenance, KPI_HISTORY.maintenance[0], 'down'),
      context: 'being serviced',
      history: KPI_HISTORY.maintenance,
      labels,
    },
    {
      id: 'tags-offline',
      label: 'Tags offline',
      icon: WifiOff,
      tone: 'ink',
      value: kpis.tagsOffline,
      trend: compareToBaseline(kpis.tagsOffline, KPI_HISTORY.tagsOffline[0], 'down'),
      context: `not seen for ${OFFLINE_AFTER_MINUTES}+ min`,
      history: KPI_HISTORY.tagsOffline,
      labels,
    },
  ]

  return (
    <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <KpiCard key={card.id} {...card} />
      ))}
    </section>
  )
}
