import { Clock, GitCommitHorizontal, GitPullRequest, Server } from 'lucide-react'
import type { BuildInfo } from '../lib/build-info'
import { formatDateTime } from '../lib/format'
import { LogoMark } from './Logo'

function builtAtLabel(value: string): string {
  return Number.isNaN(Date.parse(value)) ? value : formatDateTime(value)
}

export function Footer({ build }: { build: BuildInfo }) {
  const items = [
    { label: 'Commit', value: build.sha, Icon: GitCommitHorizontal, testId: 'build-sha' },
    { label: 'Built', value: builtAtLabel(build.builtAt), Icon: Clock, testId: 'build-time' },
    { label: 'Env', value: build.environment, Icon: Server, testId: 'build-env' },
    ...(build.previewLabel
      ? [{ label: 'Preview', value: build.previewLabel, Icon: GitPullRequest, testId: 'build-preview' }]
      : []),
  ]
  return (
    <footer className="border-t border-ink-150 bg-white" data-testid="app-footer">
      <div className="mx-auto flex max-w-[1880px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-4 text-[13px] text-ink-500 xl:px-8">
        <p className="flex items-center gap-2.5">
          <LogoMark className="size-5" />
          <span>© 2026 Trackwell (fictional product for a demo)</span>
        </p>
        <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs" data-testid="build-info">
          {items.map(({ label, value, Icon, testId }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon aria-hidden="true" className="size-3.5 text-ink-400" />
              <dt className="text-ink-500">{label}</dt>
              <dd className="font-mono font-medium text-ink-700" data-testid={testId}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  )
}
