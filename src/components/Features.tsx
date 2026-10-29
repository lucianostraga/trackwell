import { FEATURES } from '../content/features'
import { SECTION } from '../content/sections'
import { Container, SectionHeading } from './ui/Section'

/** The product: six feature cards. */
export function Features() {
  return (
    <section id={SECTION.product} aria-labelledby="product-title" className="py-24 sm:py-28" data-testid="features">
      <Container>
        <SectionHeading
          id="product-title"
          eyebrow="Product"
          title="Everything your teams need to keep equipment moving"
          description="One live view for nurses, clinical engineering and sterile processing, from the bedside to the budget meeting."
        />
        <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ id, title, description, icon: Icon }) => (
            <li
              key={id}
              data-testid="feature-card"
              className="group relative overflow-hidden rounded-2xl bg-surface p-7 shadow-card ring-1 ring-ink-150 transition duration-200 hover:-translate-y-0.5 hover:shadow-raised hover:ring-ink-200"
            >
              <div
                aria-hidden="true"
                className="absolute -top-16 -right-16 size-40 rounded-full bg-brand-100 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
              />
              <span className="relative grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 ring-inset">
                <Icon aria-hidden="true" className="size-[22px]" strokeWidth={2} />
              </span>
              <h3 className="relative mt-5 text-lg font-semibold tracking-[-0.02em] text-ink-900">{title}</h3>
              <p className="relative mt-2 text-[15px] leading-relaxed text-ink-500">{description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
