import { Accessibility, BedSingle, HeartPulse, ScanHeart, Syringe, Wind, Zap, type LucideIcon } from 'lucide-react'
import { STATUS_LABEL, TYPE_COLOR, TYPE_LABEL } from '../../lib/labels'
import type { AssetStatus, AssetType } from '../../types'
import { cn } from './cn'

export const TYPE_ICON: Record<AssetType, LucideIcon> = {
  'infusion-pump': Syringe,
  wheelchair: Accessibility,
  'patient-monitor': HeartPulse,
  ventilator: Wind,
  'hospital-bed': BedSingle,
  defibrillator: Zap,
  'portable-ultrasound': ScanHeart,
}

const STATUS_STYLE: Record<AssetStatus, { pill: string; dot: string }> = {
  'in-use': { pill: 'bg-brand-50 text-brand-700 ring-brand-100', dot: 'bg-brand-500' },
  available: { pill: 'bg-good-50 text-good-700 ring-good-100', dot: 'bg-good-500' },
  maintenance: { pill: 'bg-sun-50 text-sun-700 ring-sun-100', dot: 'bg-sun-400' },
}

export function StatusPill({ status, className }: { status: AssetStatus; className?: string }) {
  const style = STATUS_STYLE[status]
  return (
    <span
      data-testid="status-pill"
      data-status={status}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        style.pill,
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', style.dot)} />
      {STATUS_LABEL[status]}
    </span>
  )
}

/** Rounded tile with the equipment type's icon, tinted with its map color. */
export function TypeTile({ type, size = 'md' }: { type: AssetType; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = TYPE_ICON[type]
  const box = { sm: 'size-7 rounded-md', md: 'size-9 rounded-lg', lg: 'size-12 rounded-xl' }[size]
  const icon = { sm: 'size-3.5', md: 'size-[18px]', lg: 'size-6' }[size]
  return (
    <span
      aria-hidden="true"
      className={cn('relative grid shrink-0 place-items-center', box)}
      style={{ color: TYPE_COLOR[type] }}
    >
      <span className={cn('absolute inset-0 opacity-[0.12]', box)} style={{ backgroundColor: TYPE_COLOR[type] }} />
      <span className={cn('absolute inset-0 ring-1 ring-inset opacity-25', box)} style={{ color: TYPE_COLOR[type] }} />
      <Icon className={cn('relative', icon)} strokeWidth={2} />
    </span>
  )
}

/** Small colored dot matching the map. */
export function TypeDot({ type, className }: { type: AssetType; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-2.5 shrink-0 rounded-full ring-2 ring-white', className)}
      style={{ backgroundColor: TYPE_COLOR[type] }}
      title={TYPE_LABEL[type]}
    />
  )
}
