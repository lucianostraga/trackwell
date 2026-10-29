import { Quote } from 'lucide-react'
import { METRICS, METRICS_FOOTNOTE } from '../content/metrics'
import { QUOTE } from '../content/quote'
import { SECTION } from '../content/sections'
import { initialsOf } from '../lib/initials'
import { Container, SectionHeading } from './ui/Section'

/** Customer results: three customer-reported numbers and one quote. */
export function Customers() {
  return (
    <section
      id={SECTION.customers}
      aria-labelledby="customers-title"
      className="border-t border-ink-150 bg-page-subtle py-24 sm:py-28"
      data-testid="customers"
    >
      <Container>
        <SectionHeading
          id="customers-title"
          eyebrow="Customers"
          title="Care teams get hours back every week"
          description="Hospitals of every size use Trackwell to find equipment faster, rent less and keep devices clean and ready."
        />

        <div data-testid="metrics">
          <dl className="mt-16 grid overflow-hidden rounded-3xl bg-surface shadow-card ring-1 ring-ink-150 md:grid-cols-3">
            {METRICS.map((m, i) => (
              <div
                key={m.id}
                data-testid="metric"
                className={
                  i > 0
                    ? 'border-t border-ink-150 p-8 md:border-t-0 md:border-l lg:p-10'
                    : 'p-8 lg:p-10'
                }
              >
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <span className="text-gradient-brand block text-[56px] leading-none font-semibold tracking-[-0.045em] tabular lg:text-[64px]">
                    {m.value}
                  </span>
                  <span className="mt-4 block text-lg font-semibold tracking-[-0.01em] text-ink-900">{m.label}</span>
                  <span className="mt-1.5 block text-[15px] leading-relaxed text-ink-500">{m.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-center text-[13px] text-ink-400" data-testid="metrics-footnote">
            {METRICS_FOOTNOTE}
          </p>
        </div>

        <figure className="mx-auto mt-20 max-w-[880px] text-center" data-testid="customer-quote">
          <Quote aria-hidden="true" className="mx-auto size-10 fill-brand-100 text-brand-500" strokeWidth={1.5} />
          <blockquote className="mt-6 text-[24px] leading-[1.45] font-medium tracking-[-0.02em] text-balance text-ink-900 sm:text-[28px]">
            “{QUOTE.text}”
          </blockquote>
          <figcaption className="mt-8 flex items-center justify-center gap-4">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-[15px] font-semibold text-white shadow-raised ring-4 ring-surface"
            >
              {initialsOf(QUOTE.name)}
            </span>
            <span className="text-left">
              <span className="block font-semibold text-ink-900">{QUOTE.name}</span>
              <span className="block text-[15px] text-ink-500">
                {QUOTE.role}, {QUOTE.organization}
              </span>
            </span>
          </figcaption>
        </figure>
      </Container>
    </section>
  )
}
