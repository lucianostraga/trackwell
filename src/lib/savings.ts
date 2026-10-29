/** Savings calculator rules (TW-5). Pure functions; rounding is applied to the outputs only. */

export const MINUTES_SAVED_PER_ASSET_PER_MONTH = 15
export const ASSET_LIMITS = { min: 10, max: 20_000 } as const
export const HOURLY_COST_LIMITS = { min: 20, max: 200 } as const
export const SAVINGS_DEFAULTS = { assets: 500, hourlyCost: 52 } as const

export type SavingsField = 'assets' | 'hourlyCost'

export interface SavingsResult {
  /** Whole hours saved per month (Math.round of assets × 15 / 60). */
  hoursPerMonth: number
  /** USD saved per year, rounded to the nearest 1,000 (computed from the unrounded hours). */
  moneyPerYear: number
}

export type SavingsOutcome =
  | { ok: true; result: SavingsResult }
  | { ok: false; errors: Partial<Record<SavingsField, string>> }

export const ASSETS_ERROR = 'Enter a whole number of assets from 10 to 20,000.'
export const HOURLY_COST_ERROR = 'Enter an hourly cost from $20 to $200.'

/** Trims, removes thousands commas and one leading "$". Accepts only plain non-negative decimals. */
export function parseNumberInput(raw: string): number | null {
  let text = raw.trim()
  if (text.startsWith('$')) text = text.slice(1).trim()
  text = text.replace(/,/g, '')
  if (!/^(\d+(\.\d+)?|\.\d+)$/.test(text)) return null
  const value = Number(text)
  return Number.isFinite(value) ? value : null
}

export function validateAssets(value: number | null): string | null {
  if (value === null || !Number.isInteger(value)) return ASSETS_ERROR
  return value >= ASSET_LIMITS.min && value <= ASSET_LIMITS.max ? null : ASSETS_ERROR
}

export function validateHourlyCost(value: number | null): string | null {
  if (value === null || !Number.isFinite(value)) return HOURLY_COST_ERROR
  return value >= HOURLY_COST_LIMITS.min && value <= HOURLY_COST_LIMITS.max ? null : HOURLY_COST_ERROR
}

/** Pure math for already valid inputs; throws RangeError on invalid input. */
export function calculateSavings(assets: number, hourlyCost: number): SavingsResult {
  if (validateAssets(assets) !== null) throw new RangeError(ASSETS_ERROR)
  if (validateHourlyCost(hourlyCost) !== null) throw new RangeError(HOURLY_COST_ERROR)

  const hoursPerMonth = Math.round((assets * MINUTES_SAVED_PER_ASSET_PER_MONTH) / 60)

  // Exact yearly money in integer cents: hours/month × 12 × cost = assets × 15 × 12 / 60 × cost = assets × 3 × cost.
  // Integer arithmetic keeps halfway values (e.g. $157,500) exact; then round to the nearest $1,000 (half up).
  const yearlyCents = assets * ((MINUTES_SAVED_PER_ASSET_PER_MONTH * 12) / 60) * Math.round(hourlyCost * 100)
  const moneyPerYear = Math.floor((yearlyCents + 50_000) / 100_000) * 1000

  return { hoursPerMonth, moneyPerYear }
}

export function computeSavings(rawAssets: string, rawHourlyCost: string): SavingsOutcome {
  const assets = parseNumberInput(rawAssets)
  const hourlyCost = parseNumberInput(rawHourlyCost)
  const errors: Partial<Record<SavingsField, string>> = {}
  const assetsError = validateAssets(assets)
  const costError = validateHourlyCost(hourlyCost)
  if (assetsError) errors.assets = assetsError
  if (costError) errors.hourlyCost = costError
  if (assets === null || hourlyCost === null || assetsError || costError) return { ok: false, errors }
  return { ok: true, result: calculateSavings(assets, hourlyCost) }
}
