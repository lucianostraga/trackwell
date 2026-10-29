import type { ComponentPropsWithoutRef } from 'react'
import { cn } from './cn'

const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-button hover:bg-brand-700 active:bg-brand-800',
  secondary:
    'bg-surface text-ink-800 ring-1 ring-ink-200 ring-inset shadow-card hover:bg-ink-50 hover:ring-ink-300',
  light: 'bg-white text-ink-900 shadow-button hover:bg-brand-50',
  ghost: 'text-white ring-1 ring-white/25 ring-inset hover:bg-white/10',
} as const

const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-[15px] gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
} as const

interface ButtonLinkProps extends ComponentPropsWithoutRef<'a'> {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
}

/** A link styled as a button (every call to action on this page is a link). */
export function ButtonLink({ variant = 'primary', size = 'md', className, ...rest }: ButtonLinkProps) {
  return (
    <a
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-semibold tracking-[-0.01em] whitespace-nowrap transition-colors duration-150 [&>svg]:size-4',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    />
  )
}
