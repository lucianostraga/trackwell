import { CURRENT_USER } from '../data/floor'
import type { BuildInfo } from '../lib/build-info'
import { formatClock, formatShortWeekday, formatTimeZoneName } from '../lib/format'
import { EnvironmentBadge } from './EnvironmentBadge'
import { FacilitySelector } from './FacilitySelector'
import { Logo } from './Logo'
import { Avatar } from './ui/Avatar'

interface TopBarProps {
  now: Date
  build: BuildInfo
}

export function TopBar({ now, build }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-150 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1880px] items-center gap-4 px-6 xl:px-8">
        <Logo />
        <span aria-hidden="true" className="mx-1 h-7 w-px bg-ink-150" />
        <FacilitySelector />
        <span
          data-testid="live-indicator"
          className="inline-flex items-center gap-2 rounded-full bg-good-50 px-2.5 py-1 text-xs font-semibold text-good-700 ring-1 ring-good-100 ring-inset"
        >
          <span aria-hidden="true" className="live-dot relative size-2 rounded-full bg-good-500 text-good-500" />
          Live
        </span>
        <EnvironmentBadge info={build} />

        <div className="ml-auto flex items-center gap-5">
          <div className="text-right leading-tight" data-testid="live-clock">
            <time dateTime={now.toISOString()} className="block font-mono text-[15px] font-medium text-ink-900 tabular">
              {formatClock(now)}
            </time>
            <span className="text-xs text-ink-500">
              {formatShortWeekday(now)} · {formatTimeZoneName(now)}
            </span>
          </div>
          <span aria-hidden="true" className="h-8 w-px bg-ink-150" />
          <div className="flex items-center gap-3" data-testid="signed-in-user">
            <Avatar initials={CURRENT_USER.initials} background="linear-gradient(135deg, #17a596, #1e3a5f)" size="md" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink-900">{CURRENT_USER.name}</p>
              <p className="text-xs text-ink-500">{CURRENT_USER.team}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
