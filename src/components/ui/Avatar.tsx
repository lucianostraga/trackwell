import { cn } from './cn'

const SIZES = {
  xs: 'size-6 text-[10px]',
  sm: 'size-7 text-[11px]',
  md: 'size-9 text-[13px]',
  lg: 'size-10 text-sm',
} as const

interface AvatarProps {
  initials: string
  /** Background (any CSS color or gradient); omit for the neutral style. */
  background?: string
  size?: keyof typeof SIZES
  className?: string
  title?: string
}

export function Avatar({ initials, background, size = 'sm', className, title }: AvatarProps) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)} title={title}>
      <span
        aria-hidden="true"
        className={cn(
          'inline-grid place-items-center rounded-full font-semibold tracking-wide select-none',
          SIZES[size],
          background ? 'text-white shadow-sm ring-2 ring-white' : 'bg-ink-100 text-ink-600 ring-1 ring-ink-150 ring-inset',
        )}
        style={background ? { background } : undefined}
      >
        {initials}
      </span>
    </span>
  )
}

/** Initials from a full name: "Jordan Lee" -> "JL". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}
