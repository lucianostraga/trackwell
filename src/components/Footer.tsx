import { Clock, GitCommitHorizontal, GitPullRequest, Server } from 'lucide-react'
import { FOOTER_COLUMNS } from '../content/footer'
import type { BuildInfo } from '../lib/build-info'
import { formatBuildTime } from '../lib/format'
import { Logo } from './Logo'
import { Container } from './ui/Section'

export function Footer({ build }: { build: BuildInfo }) {
  const items = [
    { label: 'Commit', value: build.sha, Icon: GitCommitHorizontal, testId: 'build-sha' },
    { label: 'Built', value: formatBuildTime(build.builtAt), Icon: Clock, testId: 'build-time' },
    { label: 'Env', value: build.environment, Icon: Server, testId: 'build-env' },
    ...(build.previewLabel
      ? [{ label: 'Preview', value: build.previewLabel, Icon: GitPullRequest, testId: 'build-preview' }]
      : []),
  ]
  return (
    <footer className="mt-8 border-t border-ink-150 bg-page-subtle" data-testid="site-footer">
      <Container className="grid gap-12 pt-16 pb-12 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <Logo />
          <p className="mt-4 max-w-[300px] text-[15px] leading-relaxed text-ink-500">
            Real-time equipment tracking for hospitals. Find any device in seconds.
          </p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold text-ink-900">{col.title}</h2>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-[15px] text-ink-500 transition-colors hover:text-ink-900">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <Container className="flex flex-col gap-4 border-t border-ink-150 py-6 text-[13px] text-ink-500 lg:flex-row lg:items-center lg:justify-between">
        <p>© 2026 Trackwell (fictional company for a demo)</p>
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
      </Container>
    </footer>
  )
}
