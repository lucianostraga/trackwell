import { ArrowUpRight, GitPullRequest } from 'lucide-react'
import { SECTION } from '../content/sections'
import { formatDate } from '../lib/format'
import { jiraUrl, type Release } from '../lib/releases'
import { Container, SectionHeading } from './ui/Section'
import { cn } from './ui/cn'

/** The changelog from src/data/releases.json: a vertical timeline of cards, newest first. */
export function WhatsNew({ releases }: { releases: readonly Release[] }) {
  return (
    <section
      id={SECTION.whatsNew}
      aria-labelledby="whats-new-title"
      className="border-t border-ink-150 py-24 sm:py-28"
      data-testid="whats-new"
    >
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="whats-new-title"
            align="left"
            eyebrow="What's new"
            title="Better every week"
            description="We ship improvements continuously. Every change links to the ticket behind it."
          />
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 ring-1 ring-brand-100 ring-inset">
            <span aria-hidden="true" className="live-dot relative size-1.5 rounded-full bg-brand-500 text-brand-500" />
            <span className="tabular" data-testid="release-count">
              {releases.length} {releases.length === 1 ? 'release' : 'releases'} shipped
            </span>
          </p>
        </div>

        {releases.length === 0 ? (
          <p className="text-ink-500">Nothing shipped yet.</p>
        ) : (
          <ol className="relative space-y-3" data-testid="release-list">
            <span aria-hidden="true" className="absolute top-6 bottom-6 left-[7px] w-px bg-ink-200" />
            {releases.map((r, i) => {
              const latest = i === 0
              return (
                <li key={r.key} data-testid="release-item" className="relative grid grid-cols-[15px_minmax(0,1fr)] gap-x-5 sm:gap-x-6">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'relative mt-[23px] size-[15px] rounded-full border-[3px] bg-page',
                      latest ? 'border-brand-500 ring-4 ring-brand-100' : 'border-ink-300',
                    )}
                  />
                  <div
                    className={cn(
                      'flex flex-col gap-3 rounded-2xl px-5 py-4 ring-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6',
                      latest ? 'bg-brand-50/60 shadow-card ring-brand-200' : 'bg-surface shadow-card ring-ink-150',
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[17px] leading-snug font-semibold tracking-[-0.015em] text-ink-900" data-testid="release-title">
                          {r.title}
                        </p>
                        {latest && (
                          <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">Latest</span>
                        )}
                      </div>
                      <time dateTime={r.date} className="mt-1 block text-sm text-ink-500 tabular">
                        {formatDate(r.date, { withYear: true })}
                      </time>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-[13px]">
                      {r.pr !== null && (
                        <span className="inline-flex items-center gap-1 text-ink-500" data-testid="release-pr">
                          <GitPullRequest aria-hidden="true" className="size-3.5" />
                          PR #{r.pr}
                        </span>
                      )}
                      <a
                        href={jiraUrl(r.key)}
                        target="_blank"
                        rel="noreferrer"
                        data-testid="release-link"
                        className="inline-flex items-center gap-0.5 rounded-lg bg-surface px-2.5 py-1 font-mono font-medium text-brand-700 ring-1 ring-ink-150 ring-inset transition-colors hover:bg-brand-50 hover:ring-brand-200"
                      >
                        {r.key}
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </Container>
    </section>
  )
}
