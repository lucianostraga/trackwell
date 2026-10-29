import { describe, expect, it } from 'vitest'
import {
  displayPrice,
  FREE_MONTHS_PER_YEAR,
  MONTHS_IN_YEAR,
  MONTHS_PAID_PER_YEAR,
  monthlyEquivalent,
  yearlyTotal,
} from '../../src/lib/pricing'
import { PLANS } from '../../src/content/pricing'

describe('constants', () => {
  it('has 12 months in a year, 10 months paid per year and 2 free months', () => {
    expect(MONTHS_IN_YEAR).toBe(12)
    expect(MONTHS_PAID_PER_YEAR).toBe(10)
    expect(FREE_MONTHS_PER_YEAR).toBe(2)
  })
})

describe('yearlyTotal', () => {
  it('multiplies the list price by 10 (pay 10 months for 12)', () => {
    expect(yearlyTotal(290)).toBe(2900)
    expect(yearlyTotal(890)).toBe(8900)
    expect(yearlyTotal(1200)).toBe(12000)
  })

  it('handles the smallest valid price of one dollar', () => {
    expect(yearlyTotal(1)).toBe(10)
  })

  it.each([0, -1, 290.5, NaN, Infinity])(
    'throws RangeError for %p',
    (bad) => {
      expect(() => yearlyTotal(bad)).toThrow(RangeError)
    },
  )
})

describe('monthlyEquivalent', () => {
  it('is the yearly total divided by 12, rounded down to the dollar', () => {
    expect(monthlyEquivalent(290)).toBe(241)
    expect(monthlyEquivalent(890)).toBe(741)
    expect(monthlyEquivalent(1200)).toBe(1000)
  })

  it('rounds down exactly at a whole dollar (1200 x 10 / 12 = 1000)', () => {
    expect(monthlyEquivalent(1200)).toBe(1000)
  })

  it('handles the smallest valid price of one dollar (floor of 10 / 12 is 0)', () => {
    expect(monthlyEquivalent(1)).toBe(0)
  })

  it.each([0, -1, 290.5, NaN, Infinity])(
    'throws RangeError for %p',
    (bad) => {
      expect(() => monthlyEquivalent(bad)).toThrow(RangeError)
    },
  )
})

describe('displayPrice', () => {
  it('shows the list price, no yearly bill and no free months when monthly', () => {
    expect(displayPrice(290, 'monthly')).toEqual({ perMonth: 290, billedYearly: null, freeMonths: 0 })
    expect(displayPrice(890, 'monthly')).toEqual({ perMonth: 890, billedYearly: null, freeMonths: 0 })
  })

  it('shows the rounded-down monthly equivalent, the yearly bill and 2 free months when yearly', () => {
    expect(displayPrice(290, 'yearly')).toEqual({ perMonth: 241, billedYearly: 2900, freeMonths: 2 })
    expect(displayPrice(890, 'yearly')).toEqual({ perMonth: 741, billedYearly: 8900, freeMonths: 2 })
    expect(displayPrice(1200, 'yearly')).toEqual({ perMonth: 1000, billedYearly: 12000, freeMonths: 2 })
  })

  it('handles the smallest valid price of one dollar', () => {
    expect(displayPrice(1, 'monthly')).toEqual({ perMonth: 1, billedYearly: null, freeMonths: 0 })
    expect(displayPrice(1, 'yearly')).toEqual({ perMonth: 0, billedYearly: 10, freeMonths: 2 })
  })

  it.each([0, -1, 290.5, NaN, Infinity])(
    'throws RangeError for an invalid price with the monthly cycle (%p)',
    (bad) => {
      expect(() => displayPrice(bad, 'monthly')).toThrow(RangeError)
    },
  )

  it.each([0, -1, 290.5, NaN, Infinity])(
    'throws RangeError for an invalid price with the yearly cycle (%p)',
    (bad) => {
      expect(() => displayPrice(bad, 'yearly')).toThrow(RangeError)
    },
  )
})

describe('PLANS (src/content/pricing.ts)', () => {
  it('has the three plans in order: Starter, Growth, Enterprise', () => {
    expect(PLANS.map((plan) => plan.id)).toEqual(['starter', 'growth', 'enterprise'])
  })

  it('prices Starter at $290/month, the decided list price', () => {
    const starter = PLANS.find((plan) => plan.id === 'starter')!
    expect(starter.monthlyPrice).toBe(290)
    expect(starter.mostPopular).toBe(false)
  })

  it('prices Growth at $890/month and highlights it as most popular', () => {
    const growth = PLANS.find((plan) => plan.id === 'growth')!
    expect(growth.monthlyPrice).toBe(890)
    expect(growth.mostPopular).toBe(true)
  })

  it('gives Enterprise no price and no asset limit', () => {
    const enterprise = PLANS.find((plan) => plan.id === 'enterprise')!
    expect(enterprise.monthlyPrice).toBeNull()
    expect(enterprise.assetLimit).toBeNull()
    expect(enterprise.mostPopular).toBe(false)
  })

  it('marks only Growth as most popular', () => {
    expect(PLANS.filter((plan) => plan.mostPopular).map((plan) => plan.id)).toEqual(['growth'])
  })
})
