import { Battery, House, MapPin, Radio, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { formatDuration, formatRelativeTime, formatWhen } from '../lib/format'
import { TYPE_LABEL } from '../lib/labels'
import { locationStays, timeInCurrentZone } from '../lib/location'
import { isTagOffline } from '../lib/tags'
import { zoneName } from '../lib/zones'
import type { Asset } from '../types'
import { StatusPill, TypeTile } from './ui/Badges'
import { cn } from './ui/cn'

interface AssetDrawerProps {
  asset: Asset | null
  now: Date
  onClose: () => void
}

const EXIT_MS = 200

/** Right-side panel with everything about one asset, including where it has been. */
export function AssetDrawer({ asset, now, onClose }: AssetDrawerProps) {
  // Keep the last asset mounted while the exit animation runs.
  const [shown, setShown] = useState<Asset | null>(asset)
  const [leaving, setLeaving] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (asset) {
      setShown(asset)
      setLeaving(false)
      return
    }
    if (!shown) return
    setLeaving(true)
    const id = window.setTimeout(() => {
      setShown(null)
      setLeaving(false)
    }, EXIT_MS)
    return () => window.clearTimeout(id)
  }, [asset])

  const isOpen = asset !== null

  useEffect(() => {
    if (!isOpen) return
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus({ preventScroll: true })
    }
  }, [isOpen, onClose])

  if (!shown) return null
  const a = shown
  const offline = isTagOffline(a, now)
  const stays = locationStays(a, now)

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn('absolute inset-0 bg-ink-900/20 backdrop-blur-[2px]', leaving ? 'animate-fade-out' : 'animate-fade-in')}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-drawer-title"
        data-testid="asset-drawer"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col bg-white shadow-drawer',
          leaving ? 'animate-drawer-out' : 'animate-drawer-in',
        )}
      >
        <header className="border-b border-ink-150 px-7 pt-5 pb-5">
          <div className="flex items-center gap-2.5">
            <span
              className="rounded-md bg-ink-50 px-2 py-0.5 font-mono text-[13px] font-medium text-ink-700 ring-1 ring-ink-150 ring-inset"
              data-testid="drawer-asset-id"
            >
              {a.id}
            </span>
            <StatusPill status={a.status} />
            {offline && (
              <span className="inline-flex items-center gap-1 rounded-full bg-bad-50 px-2 py-0.5 text-xs font-medium text-bad-700 ring-1 ring-bad-100 ring-inset">
                Tag offline
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <kbd className="rounded border border-ink-200 bg-ink-50 px-1.5 font-mono text-[11px] leading-5 text-ink-500">Esc</kbd>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close asset details"
                className="grid size-8 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
              >
                <X className="size-[18px]" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3.5">
            <TypeTile type={a.type} size="lg" />
            <div>
              <h2 id="asset-drawer-title" className="text-xl leading-snug font-semibold tracking-tight text-ink-900">
                {a.name}
              </h2>
              <p className="mt-0.5 text-[13px] text-ink-500">
                {TYPE_LABEL[a.type]} · {a.model}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto px-7 py-6">
          <section aria-labelledby="drawer-now" className="rounded-xl bg-linear-to-br from-brand-50 to-white p-4 ring-1 ring-brand-100 ring-inset">
            <h3 id="drawer-now" className="text-xs font-semibold tracking-wider text-brand-700 uppercase">
              {offline ? 'Last known location' : 'Right now'}
            </h3>
            <p className="mt-2 flex items-center gap-2 text-[22px] leading-tight font-semibold tracking-tight text-ink-900" data-testid="drawer-zone">
              <MapPin aria-hidden="true" className="size-5 text-brand-600" />
              {zoneName(a.zone)}
            </p>
            <p className="mt-1 text-[13px] text-ink-600">
              Here for <span className="font-medium text-ink-900">{formatDuration(timeInCurrentZone(a, now))}</span>, since{' '}
              {formatWhen(a.zoneEnteredAt, now)}
            </p>
          </section>

          <section aria-labelledby="drawer-details">
            <SectionTitle id="drawer-details">Details</SectionTitle>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-ink-150 p-4">
              <Field label="Type">{TYPE_LABEL[a.type]}</Field>
              <Field label="Model">{a.model}</Field>
              <Field label="Status">
                <StatusPill status={a.status} />
              </Field>
              <Field label="Current zone">{zoneName(a.zone)}</Field>
              <Field label="Home department" testId="drawer-home">
                <span className="inline-flex items-center gap-1.5">
                  <House aria-hidden="true" className="size-3.5 text-ink-400" />
                  {zoneName(a.homeZone)}
                </span>
              </Field>
              <Field label="Last seen" testId="drawer-last-seen">
                <span className={cn('inline-flex items-center gap-1.5', offline && 'text-bad-700')}>
                  <Radio aria-hidden="true" className="size-3.5 text-ink-400" />
                  {formatRelativeTime(a.lastSeenAt, now)}
                </span>
              </Field>
              <Field label="Tag battery" testId="drawer-battery">
                <span className="inline-flex items-center gap-1.5 tabular">
                  <Battery aria-hidden="true" className="size-3.5 text-ink-400" />
                  {a.batteryPct}%
                </span>
              </Field>
            </dl>
          </section>

          <section aria-labelledby="drawer-history">
            <div className="flex items-baseline justify-between">
              <SectionTitle id="drawer-history">Location history</SectionTitle>
              <span className="text-xs text-ink-500 tabular">{stays.length} zones</span>
            </div>
            <ol className="mt-4" data-testid="drawer-history">
              {stays.map((stay, i) => (
                <li key={stay.enteredAt} data-testid="history-entry" className="relative flex gap-3.5 pb-5 last:pb-0">
                  {i < stays.length - 1 && <span aria-hidden="true" className="absolute top-4 bottom-0 left-[6px] w-px bg-ink-150" />}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'relative mt-1 size-[13px] shrink-0 rounded-full border-2 bg-white',
                      stay.current ? 'border-brand-500 ring-4 ring-brand-50' : 'border-ink-300',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[13.5px] font-semibold text-ink-900">
                        {zoneName(stay.zone)}
                        {stay.current && (
                          <span className="ml-2 rounded-full bg-brand-50 px-1.5 text-[11px] leading-[18px] font-semibold text-brand-700 ring-1 ring-brand-100 ring-inset">
                            Now
                          </span>
                        )}
                      </p>
                      <time dateTime={stay.enteredAt} className="text-xs whitespace-nowrap text-ink-500 tabular">
                        {formatWhen(stay.enteredAt, now)} · {formatRelativeTime(stay.enteredAt, now)}
                      </time>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {stay.current ? 'Here for' : 'Stayed'} {formatDuration(stay.durationMs)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </aside>
    </div>
  )
}

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="text-xs font-semibold tracking-wider text-ink-500 uppercase">
      {children}
    </h3>
  )
}

function Field({ label, children, testId }: { label: string; children: ReactNode; testId?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="mt-1 truncate text-[13px] font-medium text-ink-800" data-testid={testId}>
        {children}
      </dd>
    </div>
  )
}
