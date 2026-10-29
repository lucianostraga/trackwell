import { ArrowUpRight, GitPullRequest, Rocket } from 'lucide-react'
import { formatDate } from '../lib/format'
import { jiraUrl, type Release } from '../lib/releases'
import { Card, PanelHeader } from './ui/Card'
import { cn } from './ui/cn'

const MAX_VISIBLE = 6

/** "Recently shipped" as a horizontal timeline, newest on the left. */
export function ReleasesPanel({ releases }: { releases: readonly Release[] }) {
  const visible = releases.slice(0, MAX_VISIBLE)
  const hidden = releases.length - visible.length
  return (
    <Card aria-labelledby="releases-title" data-testid="releases-panel">
      <PanelHeader
        id="releases-title"
        title="Recently shipped"
        icon={<Rocket />}
        meta={
          <span className="tabular">
            {releases.length} releases{hidden > 0 && ` · ${hidden} earlier not shown`}
          </span>
        }
      />
      {visible.length === 0 ? (
        <p className="px-5 pb-5 text-[13px] text-ink-500">Nothing shipped yet.</p>
      ) : (
        <ol className="grid grid-cols-1 gap-y-4 px-5 pt-1 pb-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {visible.map((r, i) => (
            <li key={r.key} data-testid="release-item" className="relative pr-6">
              {i < visible.length - 1 && (
                <span aria-hidden="true" className="absolute top-[5px] right-0 left-4 hidden h-px bg-ink-150 xl:block" />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  'relative block size-[11px] rounded-full border-2 bg-white',
                  i === 0 ? 'border-brand-500 ring-4 ring-brand-50' : 'border-ink-300',
                )}
              />
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <a
                  href={jiraUrl(r.key)}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="release-link"
                  className="inline-flex items-center gap-0.5 rounded font-mono font-medium text-brand-600 hover:text-brand-700 hover:underline"
                >
                  {r.key}
                  <ArrowUpRight aria-hidden="true" className="size-3" />
                </a>
                {r.pr !== null && (
                  <span className="inline-flex items-center gap-1 text-ink-500">
                    <GitPullRequest aria-hidden="true" className="size-3" />
                    PR #{r.pr}
                  </span>
                )}
                {i === 0 && (
                  <span className="rounded-full bg-brand-50 px-1.5 text-[11px] leading-[18px] font-semibold text-brand-700 ring-1 ring-brand-100 ring-inset">
                    Latest
                  </span>
                )}
                <time dateTime={r.date} className="text-ink-500 tabular">
                  {formatDate(r.date)}
                </time>
              </div>
              <p className="mt-1 text-sm leading-snug font-medium text-ink-900">{r.title}</p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
