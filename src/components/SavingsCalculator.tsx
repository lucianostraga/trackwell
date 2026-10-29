import { useId, useState } from 'react'
import { SECTION } from '../content/sections'
import { SAVINGS_TEXT } from '../content/savings'
import {
  SAVINGS_DEFAULTS,
  calculateSavings,
  parseSavingsField,
  type FieldResult,
  type SavingsField,
} from '../lib/savings'
import { cn } from './ui/cn'
import { Container, SectionHeading } from './ui/Section'

const NUMBER = new Intl.NumberFormat('en-US')
const MONEY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

interface FieldProps {
  field: SavingsField
  label: string
  hint: string
  value: string
  result: FieldResult
  testId: string
  inputMode: 'numeric' | 'decimal'
  onChange: (value: string) => void
}

function Field({ field, label, hint, value, result, testId, inputMode, onChange }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const invalid = !result.ok
  return (
    <div>
      <label htmlFor={id} className="block text-[15px] font-semibold text-ink-900">
        {label}
      </label>
      <input
        id={id}
        name={field}
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${hintId} ${errorId}` : hintId}
        data-testid={testId}
        className={cn(
          'mt-2 block h-14 w-full rounded-xl bg-surface px-4 text-xl font-semibold text-ink-900 tabular shadow-card outline-none ring-1 transition-shadow',
          invalid ? 'ring-2 ring-bad-500' : 'ring-ink-150 focus:ring-2 focus:ring-brand-500',
        )}
      />
      <p id={hintId} className="mt-2 text-[13px] text-ink-400">
        Allowed: {hint}
      </p>
      <div className="min-h-7">
        {!result.ok && (
          <p id={errorId} data-testid={`${testId}-error`} className="pt-1 text-sm font-medium text-bad-700">
            {result.error}
          </p>
        )}
      </div>
    </div>
  )
}

/** Interactive calculator: hours and dollars saved from the visitor's own numbers. */
export function SavingsCalculator() {
  const [assets, setAssets] = useState(String(SAVINGS_DEFAULTS.assets))
  const [hourlyCost, setHourlyCost] = useState(String(SAVINGS_DEFAULTS.hourlyCost))

  const assetsResult = parseSavingsField('assets', assets)
  const costResult = parseSavingsField('hourlyCost', hourlyCost)
  const savings =
    assetsResult.ok && costResult.ok
      ? calculateSavings({ assets: assetsResult.value, hourlyCost: costResult.value })
      : null

  return (
    <section
      id={SECTION.savings}
      aria-labelledby="savings-title"
      className="border-t border-ink-150 py-24 sm:py-28"
      data-testid="savings-calculator"
    >
      <Container>
        <SectionHeading
          id="savings-title"
          eyebrow={SAVINGS_TEXT.eyebrow}
          title={SAVINGS_TEXT.title}
          description={SAVINGS_TEXT.description}
        />

        <div className="mt-16 grid overflow-hidden rounded-3xl bg-surface shadow-card ring-1 ring-ink-150 lg:grid-cols-2">
          <div className="space-y-4 p-8 lg:p-10">
            <Field
              field="assets"
              label={SAVINGS_TEXT.assetsLabel}
              hint={SAVINGS_TEXT.assetsHint}
              value={assets}
              result={assetsResult}
              testId="savings-assets"
              inputMode="numeric"
              onChange={setAssets}
            />
            <Field
              field="hourlyCost"
              label={SAVINGS_TEXT.hourlyCostLabel}
              hint={SAVINGS_TEXT.hourlyCostHint}
              value={hourlyCost}
              result={costResult}
              testId="savings-hourly-cost"
              inputMode="decimal"
              onChange={setHourlyCost}
            />
          </div>

          <div
            aria-live="polite"
            className="grid border-t border-ink-150 bg-page-subtle lg:border-t-0 lg:border-l"
          >
            <div className="flex flex-col justify-center p-8 lg:p-10">
              <span
                data-testid="savings-hours"
                className={cn('block text-[48px] leading-none font-semibold tracking-[-0.045em] tabular lg:text-[56px]', savings ? 'text-gradient-brand' : 'text-ink-300')}
              >
                {savings ? NUMBER.format(savings.hoursPerMonth) : SAVINGS_TEXT.empty}
              </span>
              <span className="mt-4 block text-lg font-semibold tracking-[-0.01em] text-ink-900">
                {SAVINGS_TEXT.hoursLabel}
              </span>
            </div>
            <div className="flex flex-col justify-center border-t border-ink-150 p-8 lg:p-10">
              <span
                data-testid="savings-dollars"
                className={cn('block text-[48px] leading-none font-semibold tracking-[-0.045em] tabular lg:text-[56px]', savings ? 'text-gradient-brand' : 'text-ink-300')}
              >
                {savings ? MONEY.format(savings.dollarsPerYear) : SAVINGS_TEXT.empty}
              </span>
              <span className="mt-4 block text-lg font-semibold tracking-[-0.01em] text-ink-900">
                {SAVINGS_TEXT.dollarsLabel}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-[13px] text-ink-400" data-testid="savings-footnote">
          {SAVINGS_TEXT.footnote}
        </p>
      </Container>
    </section>
  )
}
