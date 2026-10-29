import { AlertCircle, Clock, PiggyBank } from 'lucide-react'
import { useId, useState } from 'react'
import { SAVINGS_COPY as COPY } from '../content/savings'
import { SECTION } from '../content/sections'
import { formatInteger, formatUsd } from '../lib/format'
import { computeSavings, SAVINGS_DEFAULTS } from '../lib/savings'
import { Container, SectionHeading } from './ui/Section'
import { cn } from './ui/cn'

interface FieldProps {
  label: string
  hint: string
  value: string
  onChange: (value: string) => void
  error: string | undefined
  inputMode: 'numeric' | 'decimal'
  prefix?: string
  testId: string
}

/** One labelled text input with a hint and a reserved line for its error. */
function Field({ label, hint, value, onChange, error, inputMode, prefix, testId }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  return (
    <div>
      <label htmlFor={id} className="block text-[15px] font-semibold text-ink-900">
        {label}
      </label>
      <div className="relative mt-2">
        {prefix && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-lg text-ink-400">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          data-testid={testId}
          className={cn(
            'h-14 w-full rounded-xl text-lg text-ink-900 tabular shadow-card ring-1 transition-shadow ring-inset focus:ring-2 focus:outline-none',
            prefix ? 'pr-4 pl-9' : 'px-4',
            error ? 'bg-bad-50 ring-bad-500 focus:ring-bad-500' : 'bg-surface ring-ink-200 focus:ring-brand-500',
          )}
        />
      </div>
      <p id={hintId} className="mt-2 text-sm text-ink-500">
        Allowed: <span className="tabular">{hint}</span>
      </p>
      <div aria-live="polite" className="min-h-10 pt-1">
        {error && (
          <p id={errorId} data-testid={`${testId}-error`} className="flex items-start gap-2 text-sm font-medium text-bad-700">
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

/** Savings calculator: two inputs, results recomputed on every keystroke by computeSavings. */
export function SavingsCalculator() {
  const [assets, setAssets] = useState(String(SAVINGS_DEFAULTS.assets))
  const [hourlyCost, setHourlyCost] = useState(String(SAVINGS_DEFAULTS.hourlyCost))
  const outcome = computeSavings(assets, hourlyCost)
  const errors = outcome.ok ? {} : outcome.errors

  return (
    <section
      id={SECTION.savings}
      aria-labelledby="savings-title"
      className="border-t border-ink-150 py-24 sm:py-28"
      data-testid="savings"
    >
      <Container>
        <SectionHeading id="savings-title" eyebrow={COPY.eyebrow} title={COPY.title} description={COPY.description} />

        <div className="mx-auto mt-16 grid max-w-[1040px] gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-ink-150 sm:p-8">
            <div className="space-y-4">
              <Field
                label={COPY.assetsLabel}
                hint={COPY.assetsHint}
                value={assets}
                onChange={setAssets}
                error={errors.assets}
                inputMode="numeric"
                testId="savings-assets"
              />
              <Field
                label={COPY.hourlyCostLabel}
                hint={COPY.hourlyCostHint}
                value={hourlyCost}
                onChange={setHourlyCost}
                error={errors.hourlyCost}
                inputMode="decimal"
                prefix="$"
                testId="savings-hourly-cost"
              />
            </div>
          </div>

          <div className="flex flex-col rounded-2xl bg-brand-50/60 p-6 shadow-card ring-1 ring-brand-200 sm:p-8">
            <div aria-live="polite" className="flex flex-1 flex-col justify-center gap-8">
              <div>
                <p className="flex items-center gap-2 text-[15px] font-semibold text-brand-700">
                  <Clock aria-hidden="true" className="size-4" />
                  {COPY.hoursLabel}
                </p>
                <p
                  data-testid="savings-hours"
                  className="mt-2 text-[48px] leading-none font-semibold tracking-[-0.04em] text-ink-900 tabular sm:text-[56px]"
                >
                  {outcome.ok ? `${formatInteger(outcome.result.hoursPerMonth)} ${COPY.hoursUnit}` : COPY.placeholder}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-[15px] font-semibold text-brand-700">
                  <PiggyBank aria-hidden="true" className="size-4" />
                  {COPY.moneyLabel}
                </p>
                <p
                  data-testid="savings-money"
                  className="text-gradient-brand mt-2 text-[48px] leading-none font-semibold tracking-[-0.04em] tabular sm:text-[56px]"
                >
                  {outcome.ok ? formatUsd(outcome.result.moneyPerYear) : COPY.placeholder}
                </p>
              </div>
              <p className="min-h-5 text-sm text-ink-500" data-testid="savings-note">
                {outcome.ok ? COPY.validNote : COPY.invalidNote}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-[13px] text-ink-400" data-testid="savings-footnote">
          {COPY.footnote}
        </p>
      </Container>
    </section>
  )
}
