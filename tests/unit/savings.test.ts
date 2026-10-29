import { describe, expect, it } from 'vitest'
import {
  ASSETS_ERROR,
  ASSET_LIMITS,
  HOURLY_COST_ERROR,
  HOURLY_COST_LIMITS,
  MINUTES_SAVED_PER_ASSET_PER_MONTH,
  SAVINGS_DEFAULTS,
  calculateSavings,
  computeSavings,
  parseNumberInput,
  validateAssets,
  validateHourlyCost
} from '../../src/lib/savings'

describe('savings constants', () => {
  it('pins the team decision numbers', () => {
    expect(MINUTES_SAVED_PER_ASSET_PER_MONTH).toBe(15)
    expect(ASSET_LIMITS).toEqual({ min: 10, max: 20_000 })
    expect(HOURLY_COST_LIMITS).toEqual({ min: 20, max: 200 })
    expect(SAVINGS_DEFAULTS).toEqual({ assets: 500, hourlyCost: 52 })
  })

  it('uses the exact error messages from the spec', () => {
    expect(ASSETS_ERROR).toBe('Enter a whole number of assets from 10 to 20,000.')
    expect(HOURLY_COST_ERROR).toBe('Enter an hourly cost from $20 to $200.')
  })
})

describe('parseNumberInput', () => {
  it('accepts plain non-negative decimals', () => {
    expect(parseNumberInput('1200')).toBe(1200)
    expect(parseNumberInput('52.50')).toBe(52.5)
    expect(parseNumberInput('0')).toBe(0)
  })

  it('removes thousands commas and surrounding spaces', () => {
    expect(parseNumberInput('1,200')).toBe(1200)
    expect(parseNumberInput('  1,200  ')).toBe(1200)
  })

  it('removes one leading dollar sign', () => {
    expect(parseNumberInput('$52')).toBe(52)
    expect(parseNumberInput('$ 52')).toBe(52)
  })

  it('returns null for empty, non-numeric, negative, exponential or malformed input', () => {
    expect(parseNumberInput('')).toBeNull()
    expect(parseNumberInput('abc')).toBeNull()
    expect(parseNumberInput('-5')).toBeNull()
    expect(parseNumberInput('1e3')).toBeNull()
    expect(parseNumberInput('Infinity')).toBeNull()
    expect(parseNumberInput('12abc')).toBeNull()
    expect(parseNumberInput('.')).toBeNull()
  })

  it('removes only one leading dollar sign', () => {
    expect(parseNumberInput('$$52')).toBeNull()
  })
})

describe('validateAssets', () => {
  it('accepts the default 500 and whole numbers inside the range', () => {
    expect(validateAssets(500)).toBeNull()
    expect(validateAssets(100)).toBeNull()
  })

  it('accepts the limits themselves', () => {
    expect(validateAssets(10)).toBeNull()
    expect(validateAssets(20_000)).toBeNull()
  })

  it('rejects one below and one above the limits with the exact error', () => {
    expect(validateAssets(9)).toBe(ASSETS_ERROR)
    expect(validateAssets(20_001)).toBe(ASSETS_ERROR)
  })

  it('rejects fractional asset counts', () => {
    expect(validateAssets(10.5)).toBe(ASSETS_ERROR)
    expect(validateAssets(1000.25)).toBe(ASSETS_ERROR)
  })

  it('rejects null and non-finite values', () => {
    expect(validateAssets(null)).toBe(ASSETS_ERROR)
    expect(validateAssets(Infinity)).toBe(ASSETS_ERROR)
    expect(validateAssets(Number.NaN)).toBe(ASSETS_ERROR)
  })
})

describe('validateHourlyCost', () => {
  it('accepts the default $52 and cents values inside the range', () => {
    expect(validateHourlyCost(52)).toBeNull()
    expect(validateHourlyCost(52.5)).toBeNull()
    expect(validateHourlyCost(20.01)).toBeNull()
  })

  it('accepts the limits themselves', () => {
    expect(validateHourlyCost(20)).toBeNull()
    expect(validateHourlyCost(200)).toBeNull()
  })

  it('rejects one cent below and one cent above the limits with the exact error', () => {
    expect(validateHourlyCost(19.99)).toBe(HOURLY_COST_ERROR)
    expect(validateHourlyCost(200.01)).toBe(HOURLY_COST_ERROR)
  })

  it('rejects null and non-finite values', () => {
    expect(validateHourlyCost(null)).toBe(HOURLY_COST_ERROR)
    expect(validateHourlyCost(Infinity)).toBe(HOURLY_COST_ERROR)
    expect(validateHourlyCost(Number.NaN)).toBe(HOURLY_COST_ERROR)
  })
})

describe('calculateSavings', () => {
  it('returns 125 hours and $78,000 for the defaults (500 assets, $52)', () => {
    expect(calculateSavings(500, 52)).toEqual({ hoursPerMonth: 125, moneyPerYear: 78_000 })
  })

  it('returns 3 hours and $1,000 for 10 assets at $20 (2.5 rounds up; $600 rounds up)', () => {
    expect(calculateSavings(10, 20)).toEqual({ hoursPerMonth: 3, moneyPerYear: 1_000 })
  })

  it('returns 5,000 hours and $12,000,000 for 20,000 assets at $200', () => {
    expect(calculateSavings(20_000, 200)).toEqual({ hoursPerMonth: 5_000, moneyPerYear: 12_000_000 })
  })

  it('rounds hours down at 125.25: 501 assets at $52 gives 125 hours and $78,000 (from $78,156)', () => {
    expect(calculateSavings(501, 52)).toEqual({ hoursPerMonth: 125, moneyPerYear: 78_000 })
  })

  it('rounds hours up at 125.5: 502 assets at $52 gives 126 hours and $78,000 (from $78,312)', () => {
    expect(calculateSavings(502, 52)).toEqual({ hoursPerMonth: 126, moneyPerYear: 78_000 })
  })

  it('returns 300 hours and $216,000 for 1,200 assets at $60', () => {
    expect(calculateSavings(1_200, 60)).toEqual({ hoursPerMonth: 300, moneyPerYear: 216_000 })
  })

  it('computes money from the unrounded hours: 1,000 assets at $52.50 is 250 hours and $158,000 ($157,500 rounds up)', () => {
    expect(calculateSavings(1_000, 52.5)).toEqual({ hoursPerMonth: 250, moneyPerYear: 158_000 })
  })

  it('does not reuse rounded hours for the money (502 assets would be $79,000 from 126 hours)', () => {
    expect(calculateSavings(502, 52).moneyPerYear).toBe(78_000)
  })

  it('throws a RangeError with the assets message for out-of-range or fractional assets', () => {
    expect(() => calculateSavings(9, 52)).toThrow(RangeError)
    expect(() => calculateSavings(20_001, 52)).toThrow(RangeError)
    expect(() => calculateSavings(10.5, 52)).toThrow(RangeError)
    try {
      calculateSavings(9, 52)
    } catch (error) {
      expect((error as Error).message).toBe(ASSETS_ERROR)
    }
  })

  it('throws a RangeError with the cost message for out-of-range cost', () => {
    expect(() => calculateSavings(500, 19.99)).toThrow(RangeError)
    expect(() => calculateSavings(500, 200.01)).toThrow(RangeError)
    try {
      calculateSavings(500, 200.01)
    } catch (error) {
      expect((error as Error).message).toBe(HOURLY_COST_ERROR)
    }
  })
})

describe('computeSavings', () => {
  it('returns the defaults result for the default input strings', () => {
    expect(computeSavings('500', '52')).toEqual({ ok: true, result: { hoursPerMonth: 125, moneyPerYear: 78_000 } })
  })

  it('parses formatted input before computing', () => {
    expect(computeSavings('1,200', '$60')).toEqual({ ok: true, result: { hoursPerMonth: 300, moneyPerYear: 216_000 } })
    expect(computeSavings('1,000', '52.50')).toEqual({ ok: true, result: { hoursPerMonth: 250, moneyPerYear: 158_000 } })
  })

  it('reports the assets error only when assets is invalid', () => {
    expect(computeSavings('5', '52')).toEqual({ ok: false, errors: { assets: ASSETS_ERROR } })
    expect(computeSavings('', '52')).toEqual({ ok: false, errors: { assets: ASSETS_ERROR } })
    expect(computeSavings('abc', '52')).toEqual({ ok: false, errors: { assets: ASSETS_ERROR } })
    expect(computeSavings('-5', '52')).toEqual({ ok: false, errors: { assets: ASSETS_ERROR } })
    expect(computeSavings('10.5', '52')).toEqual({ ok: false, errors: { assets: ASSETS_ERROR } })
  })

  it('reports the cost error only when the cost is invalid', () => {
    expect(computeSavings('500', '19.99')).toEqual({ ok: false, errors: { hourlyCost: HOURLY_COST_ERROR } })
    expect(computeSavings('500', '200.01')).toEqual({ ok: false, errors: { hourlyCost: HOURLY_COST_ERROR } })
    expect(computeSavings('500', '')).toEqual({ ok: false, errors: { hourlyCost: HOURLY_COST_ERROR } })
    expect(computeSavings('500', 'abc')).toEqual({ ok: false, errors: { hourlyCost: HOURLY_COST_ERROR } })
  })

  it('lists an error for each invalid field when both fail at once', () => {
    expect(computeSavings('9', '500')).toEqual({
      ok: false,
      errors: { assets: ASSETS_ERROR, hourlyCost: HOURLY_COST_ERROR }
    })
    expect(computeSavings('20,001', '19.99')).toEqual({
      ok: false,
      errors: { assets: ASSETS_ERROR, hourlyCost: HOURLY_COST_ERROR }
    })
    expect(computeSavings('', 'abc')).toEqual({
      ok: false,
      errors: { assets: ASSETS_ERROR, hourlyCost: HOURLY_COST_ERROR }
    })
  })
})
