import { Check } from 'lucide-react'
import { useState } from 'react'
import { PLANS, PRICING_TEXT as T, type Plan } from '../content/pricing'
import { SECTION } from '../content/sections'
import { formatUsd } from '../lib/format'
import { displayPrice, type BillingCycle } from '../lib/pricing'
import { ButtonLink } from './ui/Button'
import { Container, SectionHeading } from './ui/Section'
import { cn } from './ui/cn'

function BillingToggle({ cycle, onChange }: { cycle: BillingCycle; onChange: (c: BillingCycle) => void }) {
  const option = (value: BillingCycle, label: string, testId: string, hint?: string) => {
    const active = cycle === value
    return (
      <button
        type="button"
        aria-pressed={active}
        data-testid={testId}
        onClick={() => onChange(value)}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-full px-5 text-[15px] font-semibold tracking-[-0.01em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
          active ? 'bg-brand-600 text-white shadow-button' : 'text-ink-600 hover:text-ink-900',
        )}
      >
        {label}
        {hint && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              active ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-700',
            )}
          >
            {hint}
          </span>
        )}
      </button>
    )
  }
  return (
    <div
      role="group"
      aria-label="Billing period"
      className="mx-auto mt-10 flex w-fit max-w-full items-center gap-1 rounded-full bg-surface p-1 shadow-card ring-1 ring-ink-150"
    >
      {option('monthly', T.monthly, 'billing-monthly')}
      {option('yearly', T.yearly, 'billing-yearly', T.yearlyHint)}
    </div>
  )
}

function PlanCard({ plan, cycle }: { plan: Plan; cycle: BillingCycle }) {
  const priced = plan.monthlyPrice !== null ? displayPrice(plan.monthlyPrice, cycle) : null
  const highlighted = plan.mostPopular
  return (
    <article
      data-testid="plan-card"
      data-plan={plan.id}
      aria-labelledby={`plan-${plan.id}-name`}
      className={cn(
        'relative flex flex-col rounded-3xl bg-surface p-8 shadow-card',
        highlighted ? 'ring-2 ring-brand-500 lg:shadow-raised' : 'ring-1 ring-ink-150',
      )}
    >
      <div className="flex min-h-7 items-center justify-between gap-3">
        <h3 id={`plan-${plan.id}-name`} className="text-xl font-semibold tracking-[-0.02em] text-ink-900">
          {plan.name}
        </h3>
        {highlighted && (
          <span
            data-testid="plan-most-popular"
            className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white"
          >
            {T.mostPopular}
          </span>
        )}
      </div>
      <p className="mt-2 min-h-[3.25rem] text-[15px] leading-relaxed text-ink-500">{plan.description}</p>

      <div aria-live="polite" className="mt-6 min-h-[116px]">
        {priced ? (
          <>
            <p className="flex items-baseline gap-1.5">
              <span
                data-testid="plan-price"
                className="text-[48px] leading-none font-semibold tracking-[-0.04em] text-ink-900 tabular"
              >
                {formatUsd(priced.perMonth)}
              </span>
              <span className="text-base text-ink-500">{T.perMonth}</span>
            </p>
            <p data-testid="plan-billing-note" className="mt-3 text-[15px] text-ink-500 tabular">
              {priced.billedYearly !== null ? `${T.billedYearlyAs} ${formatUsd(priced.billedYearly)}` : T.billedMonthly}
            </p>
            <div className="mt-3 h-6">
              {priced.freeMonths > 0 && (
                <span
                  data-testid="plan-save-badge"
                  className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-100 ring-inset"
                >
                  {T.saveBadge}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-[48px] leading-none font-semibold tracking-[-0.04em] text-ink-900">
              {T.enterprisePrice}
            </p>
            <p className="mt-3 text-[15px] text-ink-500">{T.enterpriseNote}</p>
          </>
        )}
      </div>

      <p className="mt-6 flex min-h-6 items-center gap-2 border-t border-ink-150 pt-6 text-[15px] font-medium text-ink-800">
        {plan.assetLimit && <Check aria-hidden="true" className="size-4 text-brand-600" />}
        {plan.assetLimit}
      </p>

      <div className="mt-auto pt-8">
        {priced ? (
          <ButtonLink href={`#${SECTION.contact}`} variant={highlighted ? 'primary' : 'secondary'} className="w-full">
            {T.bookDemo}
          </ButtonLink>
        ) : (
          <ButtonLink
            href={`#${SECTION.contact}`}
            variant="secondary"
            className="w-full"
            data-testid="plan-contact-sales"
          >
            {T.contactSales}
          </ButtonLink>
        )}
      </div>
    </article>
  )
}

/** Plans and prices, with a monthly / yearly billing toggle. */
export function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  return (
    <section
      id={SECTION.pricing}
      aria-labelledby="pricing-title"
      className="border-t border-ink-150 py-24 sm:py-28"
      data-testid="pricing"
    >
      <Container>
        <SectionHeading id="pricing-title" eyebrow={T.eyebrow} title={T.title} description={T.description} />
        <BillingToggle cycle={cycle} onChange={setCycle} />
        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} cycle={cycle} />
          ))}
        </div>
      </Container>
    </section>
  )
}
