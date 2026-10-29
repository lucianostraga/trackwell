import { GitPullRequest, Laptop, Radio } from 'lucide-react'
import { environmentBadgeLabel, type BuildInfo } from '../lib/build-info'
import { cn } from './ui/cn'

const STYLE = {
  production: { pill: 'bg-good-50 text-good-700 ring-good-100', dot: 'text-good-500 bg-good-500', Icon: Radio },
  preview: { pill: 'bg-sun-50 text-sun-700 ring-sun-300/70', dot: 'text-sun-400 bg-sun-400', Icon: GitPullRequest },
  local: { pill: 'bg-ink-100 text-ink-600 ring-ink-200', dot: 'text-ink-400 bg-ink-400', Icon: Laptop },
} as const

export function EnvironmentBadge({ info }: { info: BuildInfo }) {
  const style = STYLE[info.environment]
  const { Icon } = style
  return (
    <span
      data-testid="environment-badge"
      data-environment={info.environment}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        style.pill,
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 rounded-full animate-pulse-dot', style.dot)} />
      <Icon aria-hidden="true" className="-ml-0.5 size-3.5" strokeWidth={2.25} />
      {environmentBadgeLabel(info)}
    </span>
  )
}
