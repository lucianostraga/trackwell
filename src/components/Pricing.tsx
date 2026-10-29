import { useState } from 'react'
import { PLANS } from '../content/pricing'
import { SECTION } from '../content/sections'
import { type Billing, planPrice } from '../lib/pricing'
import { sectionHref } from '../lib/sections'
import { cn } from './ui/cn'
import { ButtonLink } from './ui/Button'
import { Container, SectionHeading } from './ui/Section'

const OPTIONS: ReadonlyArray<{ id: Billing; label: string }> = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
]

const usd = (n: number) => `$${n.toLocaleString('en-US')}`

/** Plans and prices, with a monthly / yearly billing switch. */
export function Pricing() {
  const [billing, setBilling] = useState<Billing>('monthly')

  return (
    <section
      id={SECTION.pricing}
      aria-labelledby="pricing-title"
      className="border-t border-ink-150 bg-page-subtle py-24 sm:py-28"
      data-testid="pricing"
    >
      <Container>
        <SectionHeading
          id="pricing-title"
          eyebrow="Pricing"
          title="Simple plans that grow with your hospital"
          description="Pick the plan that fits your equipment. Pay yearly and get 2 months free."
        />

        <div className="mt-10 flex justify-center">
          <div
            role="radiogroup"
            aria-label="Billing period"
            className="inline-flex rounded-full bg-ink-100 p-1 ring-1 ring-ink-200 ring-inset"
          >
            {OPTIONS.map(({ id, label }) => {
              const active = billing === id
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-testid={`billing-${id}`}
                  onClick={() => setBilling(id)}
                  className={cn(
                    'h-10 min-w-28 cursor-pointer rounded-full px-5 text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-150',
                    active ? 'bg-surface text-ink-900 shadow-card' : 'text-ink-500 hover:text-ink-800',
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <ul className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = planPrice(plan.monthlyPrice, billing)
            const { perMonth, perYear, monthsFree } = price
            const paid = perMonth !== null
            return (
              <li
                key={plan.id}
                data-testid="plan-card"
                data-plan={plan.id}
                className={cn(
                  'relative flex flex-col rounded-3xl bg-surface p-8 shadow-card',
                  plan.highlighted ? 'ring-2 ring-brand-500 shadow-raised' : 'ring-1 ring-ink-150',
                )}
              >
                <div className="flex h-7 items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-ink-900">{plan.name}</h3>
                  {plan.highlighted && (
                    <span
                      data-testid="plan-popular"
                      className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white"
                    >
                      Most popular
                    </span>
                  )}
                </div>
                <p className="mt-2 min-h-[52px] text-[15px] leading-relaxed text-ink-500">{plan.description}</p>

                <div className="mt-6 flex h-[60px] items-baseline gap-2">
                  {paid ? (
                    <>
                      <span
                        data-testid="plan-price"
                        className="text-[48px] leading-none font-semibold tracking-[-0.045em] text-ink-900 tabular"
                      >
                        {usd(perMonth)}
                      </span>
                      <span className="text-[15px] text-ink-500">/ month</span>
                    </>
                  ) : (
                    <span data-testid="plan-price" className="text-[32px] leading-none font-semibold tracking-[-0.04em] text-ink-900">
                      Custom pricing
                    </span>
                  )}
                </div>

                <div className="mt-3 flex h-7 items-center gap-3 text-[14px] text-ink-500">
                  {paid && monthsFree > 0 && perYear !== null ? (
                    <>
                      <span data-testid="plan-billed">billed {usd(perYear)} per year</span>
                      <span
                        data-testid="plan-save"
                        className="rounded-full bg-good-50 px-2.5 py-0.5 text-xs font-semibold text-good-700 ring-1 ring-good-100 ring-inset"
                      >
                        Save {monthsFree} months
                      </span>
                    </>
                  ) : paid ? (
                    <span>billed monthly</span>
                  ) : (
                    <span>Talk to sales about your hospital group</span>
                  )}
                </div>

                <p className="mt-5 h-6 text-[15px] font-semibold text-ink-800" data-testid={paid ? 'plan-assets' : undefined}>
                  {plan.assetLimit !== null ? `up to ${plan.assetLimit.toLocaleString('en-US')} assets` : null}
                </p>

                <div className="mt-8 flex flex-1 items-end">
                  <ButtonLink
                    href={sectionHref(SECTION.contact)}
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    size="lg"
                    className="w-full"
                    data-testid={paid ? undefined : 'plan-contact-sales'}
                  >
                    {paid ? 'Book a demo' : 'Contact sales'}
                  </ButtonLink>
                </div>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
