import { describe, expect, it } from 'vitest'
import { PAID_MONTHS_PER_YEAR, planPrice } from '../../src/lib/pricing'
import type { Billing, Plan } from '../../src/lib/pricing'
import { PLANS } from '../../src/content/pricing'

describe('PAID_MONTHS_PER_YEAR', () => {
  it('is 10 (yearly billing is 2 months free)', () => {
    expect(PAID_MONTHS_PER_YEAR).toBe(10)
  })
})

describe('planPrice', () => {
  describe('monthly billing', () => {
    it('returns 290 / 3480 / 0 for $290', () => {
      expect(planPrice(290, 'monthly')).toEqual({ perMonth: 290, perYear: 3480, monthsFree: 0 })
    })

    it('returns 890 / 10680 / 0 for $890', () => {
      expect(planPrice(890, 'monthly')).toEqual({ perMonth: 890, perYear: 10680, monthsFree: 0 })
    })

    it('returns 0 / 0 / 0 for a free plan', () => {
      expect(planPrice(0, 'monthly')).toEqual({ perMonth: 0, perYear: 0, monthsFree: 0 })
    })

    it('returns 1 / 12 / 0 for the smallest positive price', () => {
      expect(planPrice(1, 'monthly')).toEqual({ perMonth: 1, perYear: 12, monthsFree: 0 })
    })
  })

  describe('yearly billing', () => {
    it('returns 241 / 2900 / 2 for $290 (241.67 rounds down, not 242)', () => {
      expect(planPrice(290, 'yearly')).toEqual({ perMonth: 241, perYear: 2900, monthsFree: 2 })
    })

    it('returns 741 / 8900 / 2 for $890 (741.67 rounds down, not 742)', () => {
      expect(planPrice(890, 'yearly')).toEqual({ perMonth: 741, perYear: 8900, monthsFree: 2 })
    })

    it('returns 0 / 0 / 2 for a free plan', () => {
      expect(planPrice(0, 'yearly')).toEqual({ perMonth: 0, perYear: 0, monthsFree: 2 })
    })

    it('returns 10 / 120 / 2 for $12 (exact division, no rounding needed)', () => {
      expect(planPrice(12, 'yearly')).toEqual({ perMonth: 10, perYear: 120, monthsFree: 2 })
    })
  })

  describe('no public price (null)', () => {
    it('returns null / null / 0 for monthly billing', () => {
      expect(planPrice(null, 'monthly')).toEqual({ perMonth: null, perYear: null, monthsFree: 0 })
    })

    it('returns null / null / 0 for yearly billing', () => {
      expect(planPrice(null, 'yearly')).toEqual({ perMonth: null, perYear: null, monthsFree: 0 })
    })
  })

  describe('invalid prices', () => {
    it.each([
      [-1, 'a negative price'],
      [290.5, 'a fractional price'],
      [NaN, 'NaN'],
      [Infinity, 'Infinity'],
      [-Infinity, '-Infinity'],
    ] as const)('throws a RangeError for %s', (price, _label) => {
      expect(() => planPrice(price, 'monthly')).toThrow(RangeError)
      expect(() => planPrice(price, 'yearly')).toThrow(RangeError)
    })
  })
})

const billing: Billing[] = ['monthly', 'yearly']

describe('PLANS (src/content/pricing.ts)', () => {
  it('lists Starter, Growth and Enterprise in that order', () => {
    expect(PLANS.map((plan) => plan.id)).toEqual(['starter', 'growth', 'enterprise'])
  })

  it('prices Starter at 290 with an asset limit of 250', () => {
    const starter: Plan = PLANS[0]
    expect(starter.monthlyPrice).toBe(290)
    expect(starter.assetLimit).toBe(250)
  })

  it('prices Growth at 890 with an asset limit of 1000', () => {
    const growth: Plan = PLANS[1]
    expect(growth.monthlyPrice).toBe(890)
    expect(growth.assetLimit).toBe(1000)
  })

  it('leaves Enterprise without a public price or asset limit', () => {
    const enterprise: Plan = PLANS[2]
    expect(enterprise.monthlyPrice).toBeNull()
    expect(enterprise.assetLimit).toBeNull()
  })

  it('highlights Growth and only Growth', () => {
    expect(PLANS.map((plan) => plan.highlighted)).toEqual([false, true, false])
    expect(PLANS.filter((plan) => plan.highlighted).map((plan) => plan.id)).toEqual(['growth'])
  })

  it('gives every plan a name and a one-line description', () => {
    for (const plan of PLANS) {
      expect(plan.name).toBeTruthy()
      expect(typeof plan.description).toBe('string')
      expect(plan.description.length).toBeGreaterThan(0)
    }
  })

  it('keeps Enterprise unpriced through planPrice on every billing', () => {
    for (const b of billing) {
      expect(planPrice(PLANS[2].monthlyPrice, b)).toEqual({ perMonth: null, perYear: null, monthsFree: 0 })
    }
  })
})
