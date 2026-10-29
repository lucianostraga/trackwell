export type BillingCycle = 'monthly' | 'yearly'
export const MONTHS_IN_YEAR = 12
export const MONTHS_PAID_PER_YEAR = 10
export const FREE_MONTHS_PER_YEAR = MONTHS_IN_YEAR - MONTHS_PAID_PER_YEAR

export interface DisplayPrice {
  /** Whole USD per month shown big on the card. Monthly: the list price. Yearly: floor(yearly total / 12). */
  perMonth: number
  /** Yearly: what is billed once a year (list price × 10). Monthly: null. */
  billedYearly: number | null
  /** Months free: 2 when yearly, 0 when monthly. */
  freeMonths: number
}

function assertPrice(monthlyPrice: number): void {
  if (!Number.isInteger(monthlyPrice) || monthlyPrice <= 0) {
    throw new RangeError(`Monthly price must be a positive whole number of dollars, got ${monthlyPrice}`)
  }
}

/** list price × 10. Throws RangeError unless monthlyPrice is a positive integer (whole dollars). */
export function yearlyTotal(monthlyPrice: number): number {
  assertPrice(monthlyPrice)
  return monthlyPrice * MONTHS_PAID_PER_YEAR
}

/** Math.floor(list price × 10 / 12). Same validation. */
export function monthlyEquivalent(monthlyPrice: number): number {
  return Math.floor(yearlyTotal(monthlyPrice) / MONTHS_IN_YEAR)
}

/** The price a card shows for a billing cycle. Same validation. */
export function displayPrice(monthlyPrice: number, cycle: BillingCycle): DisplayPrice {
  assertPrice(monthlyPrice)
  if (cycle === 'yearly') {
    return {
      perMonth: monthlyEquivalent(monthlyPrice),
      billedYearly: yearlyTotal(monthlyPrice),
      freeMonths: FREE_MONTHS_PER_YEAR,
    }
  }
  return { perMonth: monthlyPrice, billedYearly: null, freeMonths: 0 }
}
