import { useState } from 'react'
import { FAQ } from '../content/faq'
import { SECTION } from '../content/sections'
import { filterFaq } from '../lib/faq'
import { sectionHref } from '../lib/sections'
import { cn } from './ui/cn'
import { Container, SectionHeading } from './ui/Section'

/** Frequently asked questions: a search box and a one-at-a-time accordion. */
export function Faq() {
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const items = filterFaq(FAQ, query)
  const activeId = items.some((i) => i.id === openId) ? openId : null
  const count = `${items.length} ${items.length === 1 ? 'question' : 'questions'}`

  return (
    <section
      id={SECTION.faq}
      aria-labelledby="faq-title"
      className="border-t border-ink-150 py-24 sm:py-28"
      data-testid="faq"
    >
      <Container>
        <SectionHeading
          id="faq-title"
          eyebrow="FAQ"
          title="Questions, answered"
          description="Search the most common questions about Trackwell."
        />

        <div className="mx-auto mt-10 max-w-[880px]">
          <div className="flex items-center gap-4">
            <label htmlFor="faq-search" className="sr-only">
              Search questions
            </label>
            <input
              id="faq-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions"
              autoComplete="off"
              data-testid="faq-search"
              className="h-12 w-full rounded-full bg-surface px-5 text-[16px] text-ink-900 shadow-card ring-1 ring-ink-200 outline-none ring-inset placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500"
            />
            <p
              aria-live="polite"
              data-testid="faq-count"
              className="w-32 shrink-0 text-right text-[14px] font-medium text-ink-500 tabular"
            >
              {count}
            </p>
          </div>

          <div className="mt-6 min-h-[560px]">
            {items.length === 0 ? (
              <p
                data-testid="faq-empty"
                className="rounded-3xl bg-surface p-8 text-center text-[16px] text-ink-600 shadow-card ring-1 ring-ink-150"
              >
                {`No answers for "${query.trim()}". `}
                <a
                  href={sectionHref(SECTION.contact)}
                  data-testid="faq-empty-contact"
                  className="font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-600"
                >
                  Ask us directly
                </a>
              </p>
            ) : (
              <ul className="space-y-3">
                {items.map((item) => {
                  const open = item.id === activeId
                  return (
                    <li
                      key={item.id}
                      data-testid="faq-item"
                      className={cn(
                        'rounded-2xl bg-surface shadow-card',
                        open ? 'ring-2 ring-brand-500' : 'ring-1 ring-ink-150',
                      )}
                    >
                      <h3>
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-controls={`faq-panel-${item.id}`}
                          id={`faq-q-${item.id}`}
                          data-testid="faq-question"
                          onClick={() => setOpenId(open ? null : item.id)}
                          className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl px-6 py-4 text-left text-[17px] font-semibold tracking-[-0.01em] text-ink-900"
                        >
                          {item.question}
                          <span
                            aria-hidden="true"
                            className={cn('text-xl leading-none text-brand-600 transition-transform', open && 'rotate-45')}
                          >
                            +
                          </span>
                        </button>
                      </h3>
                      {open && (
                        <div
                          id={`faq-panel-${item.id}`}
                          role="region"
                          aria-labelledby={`faq-q-${item.id}`}
                          data-testid="faq-answer"
                          className="px-6 pb-5 text-[16px] leading-relaxed text-ink-600"
                        >
                          {item.answer}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
