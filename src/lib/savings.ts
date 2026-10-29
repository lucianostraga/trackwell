export const MINUTES_SAVED_PER_ASSET_PER_MONTH = 15
export const SAVINGS_DEFAULTS = { assets: 500, hourlyCost: 52 } as const
export const SAVINGS_LIMITS = {
  assets: { min: 10, max: 20_000 },
  hourlyCost: { min: 20, max: 200 },
} as const

export type SavingsField = 'assets' | 'hourlyCost'
export interface SavingsInput { assets: number; hourlyCost: number }
export interface SavingsResult { hoursPerMonth: number; dollarsPerYear: number }
export type FieldResult = { ok: true; value: number } | { ok: false; error: string }

const ERRORS: Record<SavingsField, string> = {
  assets: 'Enter a whole number of assets from 10 to 20,000.',
  hourlyCost: 'Enter an hourly cost from $20 to $200.',
}

const ASSETS_PATTERN = /^(\d+|\d{1,3}(,\d{3})+)$/
const COST_PATTERN = /^\$?(\d+|\d{1,3}(,\d{3})+)(\.\d{1,2})?$/

function inRange(field: SavingsField, value: number): boolean {
  const { min, max } = SAVINGS_LIMITS[field]
  return Number.isFinite(value) && value >= min && value <= max
}

/** Validates what the visitor typed in one field. */
export function parseSavingsField(field: SavingsField, raw: string): FieldResult {
  const fail: FieldResult = { ok: false, error: ERRORS[field] }
  const text = raw.trim()
  const pattern = field === 'assets' ? ASSETS_PATTERN : COST_PATTERN
  if (!pattern.test(text)) return fail
  const value = Number(text.replace(/[$,]/g, ''))
  if (!inRange(field, value)) return fail
  return { ok: true, value }
}

/** Hours per month and dollars per year. Throws RangeError if an input is not finite or outside SAVINGS_LIMITS. */
export function calculateSavings(input: SavingsInput): SavingsResult {
  const { assets, hourlyCost } = input
  if (!inRange('assets', assets) || !inRange('hourlyCost', hourlyCost)) {
    throw new RangeError('Savings inputs are outside the allowed range.')
  }
  // Integer math keeps exact half-way values (for example $61,500) from rounding down.
  const costCents = Math.round(hourlyCost * 100)
  const yearlyMinutes = assets * MINUTES_SAVED_PER_ASSET_PER_MONTH * 12
  const hoursExact = (assets * MINUTES_SAVED_PER_ASSET_PER_MONTH) / 60
  return {
    hoursPerMonth: Math.round(hoursExact),
    dollarsPerYear: Math.round((yearlyMinutes * costCents) / 6_000_000) * 1000,
  }
}
