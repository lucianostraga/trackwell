export type Billing = 'monthly' | 'yearly'
export type PlanId = 'starter' | 'growth' | 'enterprise'

export interface Plan {
  id: PlanId
  name: string
  /** USD per month on monthly billing; null = no public price (Contact sales). */
  monthlyPrice: number | null
  /** Asset limit; null = no limit shown. */
  assetLimit: number | null
  highlighted: boolean
}

export const PAID_MONTHS_PER_YEAR = 10

export interface PlanPrice {
  /** Whole dollars per month to display, or null when the plan has no public price. */
  perMonth: number | null
  /** What a year costs on this billing (monthly × 12 or monthly × 10); null without a price. */
  perYear: number | null
  /** Months free on this billing: 0 monthly, 2 yearly; 0 without a price. */
  monthsFree: number
}

export function planPrice(monthlyPrice: number | null, billing: Billing): PlanPrice {
  if (monthlyPrice === null) return { perMonth: null, perYear: null, monthsFree: 0 }
  if (!Number.isFinite(monthlyPrice) || !Number.isInteger(monthlyPrice) || monthlyPrice < 0) {
    throw new RangeError(`Invalid monthly price: ${monthlyPrice}`)
  }
  if (billing === 'yearly') {
    const perYear = monthlyPrice * PAID_MONTHS_PER_YEAR
    return { perMonth: Math.floor(perYear / 12), perYear, monthsFree: 12 - PAID_MONTHS_PER_YEAR }
  }
  return { perMonth: monthlyPrice, perYear: monthlyPrice * 12, monthsFree: 0 }
}
