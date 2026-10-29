import { SECTION } from '../content/sections'
import { STEPS } from '../content/steps'
import { Container, SectionHeading } from './ui/Section'

/** Three steps, left to right, joined by a dashed line on wide screens. */
export function HowItWorks() {
  return (
    <section
      id={SECTION.howItWorks}
      aria-labelledby="how-title"
      className="border-y border-ink-150 bg-page-subtle py-24 sm:py-28"
      data-testid="how-it-works"
    >
      <Container>
        <SectionHeading
          id="how-title"
          eyebrow="How it works"
          title="Up and running on your floor in a week"
          description="No rewiring and no new devices for staff to carry. Tag your equipment once and Trackwell does the rest."
        />
        <ol className="relative mt-16 grid gap-6 md:grid-cols-3 lg:gap-8">
          <span
            aria-hidden="true"
            className="absolute top-[52px] right-[16%] left-[16%] hidden border-t-2 border-dashed border-brand-200 md:block"
          />
          {STEPS.map(({ id, title, description, icon: Icon }, i) => (
            <li
              key={id}
              data-testid="how-step"
              className="relative rounded-2xl bg-surface p-7 shadow-card ring-1 ring-ink-150 lg:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="relative grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-fill-500 to-fill-700 text-white shadow-raised ring-4 ring-surface">
                  <Icon aria-hidden="true" className="size-6" strokeWidth={2} />
                </span>
                <span className="font-mono text-sm font-medium text-ink-300 tabular">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-ink-900">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
