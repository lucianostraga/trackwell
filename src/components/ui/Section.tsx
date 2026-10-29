import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from './cn'

/** Page-width container shared by every section. */
export function Container({ className, ...rest }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('mx-auto w-full max-w-[1240px] px-5 sm:px-8', className)} {...rest} />
}

interface SectionHeadingProps {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  id?: string
  align?: 'center' | 'left'
  className?: string
}

/** Eyebrow, title and lead paragraph at the top of a section. */
export function SectionHeading({ eyebrow, title, description, id, align = 'center', className }: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' ? 'mx-auto max-w-[720px] text-center' : 'max-w-[560px]', className)}>
      <p className="text-sm font-semibold tracking-[0.08em] text-brand-600 uppercase">{eyebrow}</p>
      <h2
        id={id}
        className="mt-3 text-[32px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance text-ink-900 sm:text-[40px] xl:text-[44px]"
      >
        {title}
      </h2>
      {description && <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-500">{description}</p>}
    </div>
  )
}
