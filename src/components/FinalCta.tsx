import { ArrowRight } from 'lucide-react'
import { SECTION } from '../content/sections'
import { sectionHref } from '../lib/sections'
import { ButtonLink } from './ui/Button'
import { Container } from './ui/Section'

/** Dark closing band: "See Trackwell on your floor". */
export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-title" className="pb-8" data-testid="final-cta">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[32px] bg-night px-6 py-20 text-center shadow-pop sm:px-16 sm:py-24">
          <div
            aria-hidden="true"
            className="absolute -top-40 left-1/2 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-brand-500)_55%,transparent),transparent)] blur-2xl"
          />
          <div
            aria-hidden="true"
            className="hero-grid absolute inset-0 -z-10 opacity-[0.07] [mask-image:radial-gradient(ellipse_60%_80%_at_50%_0%,black,transparent)]"
          />
          <h2
            id="final-cta-title"
            className="mx-auto max-w-[760px] text-[36px] leading-[1.08] font-semibold tracking-[-0.035em] text-balance text-white sm:text-[52px]"
          >
            See Trackwell on your floor
          </h2>
          <p className="mx-auto mt-5 max-w-[560px] text-lg leading-relaxed text-pretty text-ink-300">
            In a 30-minute walkthrough we map one of your units and show you its equipment, live.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={sectionHref(SECTION.contact)} variant="light" size="lg" data-testid="cta-book-demo">
              Book a demo
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href={sectionHref(SECTION.howItWorks)} variant="ghost" size="lg">
              See how it works
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  )
}
