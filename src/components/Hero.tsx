import { ArrowRight, BellRing, ChevronRight, Wind } from 'lucide-react'
import { HERO } from '../content/hero'
import { SECTION } from '../content/sections'
import { publicAsset } from '../lib/assets'
import { sectionHref } from '../lib/sections'
import { ProductFrame } from './ProductFrame'
import { ButtonLink } from './ui/Button'
import { Container } from './ui/Section'

/** Small floating cards over the screenshot that tell the story at a glance (wide screens only). */
function FloatingCards() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute top-[47%] -left-10 hidden w-[264px] animate-float rounded-2xl bg-surface/95 p-4 shadow-pop ring-1 ring-ink-900/[0.06] backdrop-blur xl:block 2xl:-left-16"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-600">
            <Wind className="size-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">Ventilator VT-07</p>
            <p className="text-[13px] text-ink-500">ICU · Bay 4 · available</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-[13px] font-medium text-brand-700">
          <span className="flex items-center gap-2">
            <span className="live-dot relative size-2 rounded-full bg-brand-500 text-brand-500" />
            Found in 4 seconds
          </span>
          <ChevronRight className="size-4" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute -right-10 bottom-[30%] hidden w-[280px] animate-float rounded-2xl bg-surface/95 p-4 shadow-pop ring-1 ring-ink-900/[0.06] backdrop-blur [animation-delay:-3s] xl:block 2xl:-right-16"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sun-50 text-sun-600">
            <BellRing className="size-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">Infusion pump left Ward A</p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink-500">Now in the main elevator lobby. Charge team notified.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export function Hero() {
  const shot = HERO.screenshot
  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-hidden" data-testid="hero">
      <div aria-hidden="true" className="hero-grid absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="absolute top-[-280px] left-1/2 -z-10 h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-brand-200)_70%,transparent),transparent)] opacity-70 blur-2xl"
      />
      <Container className="pt-14 sm:pt-20 xl:pt-24">
        <div className="mx-auto max-w-[920px] text-center">
          <a
            href={sectionHref(SECTION.product)}
            className="group inline-flex items-center gap-2 rounded-full bg-surface/80 py-1 pr-3 pl-3 text-[13px] sm:pl-1 font-medium text-ink-600 shadow-card ring-1 ring-ink-150 backdrop-blur transition-colors hover:ring-ink-200 sm:text-sm"
          >
            <span className="hidden rounded-full bg-brand-50 px-2.5 py-0.5 font-semibold text-brand-700 ring-1 ring-brand-100 ring-inset sm:inline">
              Live
            </span>
            {HERO.badge}
            <ChevronRight aria-hidden="true" className="size-4 text-ink-400 transition-transform group-hover:translate-x-0.5" />
          </a>
          <h1
            id="hero-title"
            className="mt-7 text-[42px] leading-[1.04] font-semibold tracking-[-0.04em] text-balance text-ink-900 sm:text-6xl lg:text-[72px] 2xl:text-[80px]"
          >
            {HERO.titleLead} <span className="text-gradient-brand">{HERO.titleAccent}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[720px] text-lg leading-relaxed text-pretty text-ink-500 sm:text-xl">
            {HERO.subtitle}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={sectionHref(SECTION.contact)} size="lg" data-testid="hero-book-demo">
              {HERO.primaryCta}
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href={sectionHref(SECTION.howItWorks)} variant="secondary" size="lg" data-testid="hero-how-it-works">
              {HERO.secondaryCta}
            </ButtonLink>
          </div>
        </div>

        <div className="relative mx-auto mt-14 max-w-[1160px] sm:mt-16">
          <ProductFrame
            src={publicAsset(shot.file)}
            alt={shot.alt}
            url={shot.url}
            width={shot.width}
            height={shot.height}
          />
          <FloatingCards />
        </div>
      </Container>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-page via-page/80 to-transparent"
      />
    </section>
  )
}
