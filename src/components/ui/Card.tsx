import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from './cn'

export function Card({ className, ...rest }: ComponentPropsWithoutRef<'section'>) {
  return (
    <section
      className={cn('rounded-xl border border-ink-150 bg-surface shadow-card', className)}
      {...rest}
    />
  )
}

interface PanelHeaderProps {
  title: string
  icon?: ReactNode
  meta?: ReactNode
  id?: string
}

/** Title row used by the side panels. */
export function PanelHeader({ title, icon, meta, id }: PanelHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
      <h2 id={id} className="flex items-center gap-2 text-[15px] font-semibold text-ink-900">
        {icon && <span className="text-ink-400 [&>svg]:size-4">{icon}</span>}
        {title}
      </h2>
      {meta && <div className="text-[13px] text-ink-500">{meta}</div>}
    </header>
  )
}
