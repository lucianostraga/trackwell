import { describe, expect, it } from 'vitest'
import {
  calculateSavings,
  MINUTES_SAVED_PER_ASSET_PER_MONTH,
  parseSavingsField,
  SAVINGS_DEFAULTS,
  SAVINGS_LIMITS,
} from '../../src/lib/savings'

describe('constants', () => {
  it('saves 15 minutes per asset per month', () => {
    expect(MINUTES_SAVED_PER_ASSET_PER_MONTH).toBe(15)
  })

  it('defaults to 500 assets and $52 per hour', () => {
    expect(SAVINGS_DEFAULTS).toEqual({ assets: 500, hourlyCost: 52 })
  })

  it('allows 10 to 20,000 assets and $20 to $200 per hour', () => {
    expect(SAVINGS_LIMITS).toEqual({
      assets: { min: 10, max: 20_000 },
      hourlyCost: { min: 20, max: 200 },
    })
  })
})

describe('parseSavingsField', () => {
  describe('assets', () => {
    it('accepts a plain whole number', () => {
      expect(parseSavingsField('assets', '500')).toEqual({ ok: true, value: 500 })
    })

    it('trims surrounding spaces', () => {
      expect(parseSavingsField('assets', '  500  ')).toEqual({ ok: true, value: 500 })
    })

    it('accepts thousands commas', () => {
      expect(parseSavingsField('assets', '1,200')).toEqual({ ok: true, value: 1200 })
      expect(parseSavingsField('assets', '20,000')).toEqual({ ok: true, value: 20_000 })
    })

    it('accepts the bounds 10 and 20,000', () => {
      expect(parseSavingsField('assets', '10')).toEqual({ ok: true, value: 10 })
      expect(parseSavingsField('assets', '20,000')).toEqual({ ok: true, value: 20_000 })
    })

    it('rejects 9 and 20,001 as out of range', () => {
      expect(parseSavingsField('assets', '9')).toEqual({
        ok: false,
        error: 'Enter a whole number of assets from 10 to 20,000.',
      })
      expect(parseSavingsField('assets', '20,001')).toEqual({
        ok: false,
        error: 'Enter a whole number of assets from 10 to 20,000.',
      })
    })

    it('rejects a non-whole number like 10.5', () => {
      expect(parseSavingsField('assets', '10.5')).toEqual({
        ok: false,
        error: 'Enter a whole number of assets from 10 to 20,000.',
      })
    })

    it('rejects empty, non-numeric and signed input', () => {
      const error = 'Enter a whole number of assets from 10 to 20,000.'
      for (const raw of ['', '   ', 'abc', '1e3', '-5', '12abc']) {
        expect(parseSavingsField('assets', raw)).toEqual({ ok: false, error })
      }
    })
  })

  describe('hourlyCost', () => {
    it('accepts a whole number', () => {
      expect(parseSavingsField('hourlyCost', '52')).toEqual({ ok: true, value: 52 })
    })

    it('trims surrounding spaces', () => {
      expect(parseSavingsField('hourlyCost', '  47.50  ')).toEqual({ ok: true, value: 47.5 })
    })

    it('accepts up to 2 decimals', () => {
      expect(parseSavingsField('hourlyCost', '47.5')).toEqual({ ok: true, value: 47.5 })
      expect(parseSavingsField('hourlyCost', '47.50')).toEqual({ ok: true, value: 47.5 })
    })

    it('accepts an optional leading dollar sign', () => {
      expect(parseSavingsField('hourlyCost', '$52')).toEqual({ ok: true, value: 52 })
      expect(parseSavingsField('hourlyCost', '$120')).toEqual({ ok: true, value: 120 })
      expect(parseSavingsField('hourlyCost', '$200.00')).toEqual({ ok: true, value: 200 })
    })

    it('accepts the bounds $20 and $200', () => {
      expect(parseSavingsField('hourlyCost', '20')).toEqual({ ok: true, value: 20 })
      expect(parseSavingsField('hourlyCost', '$200')).toEqual({ ok: true, value: 200 })
    })

    it('rejects 19.99 and 200.01 as out of range', () => {
      const error = 'Enter an hourly cost from $20 to $200.'
      expect(parseSavingsField('hourlyCost', '19.99')).toEqual({ ok: false, error })
      expect(parseSavingsField('hourlyCost', '200.01')).toEqual({ ok: false, error })
    })

    it('rejects empty, non-numeric and signed input', () => {
      const error = 'Enter an hourly cost from $20 to $200.'
      for (const raw of ['', '   ', 'abc', '1e3', '-5', '12abc']) {
        expect(parseSavingsField('hourlyCost', raw)).toEqual({ ok: false, error })
      }
    })
  })
})

describe('calculateSavings', () => {
  it('returns 125 hours and $78,000 for 500 assets at $52', () => {
    expect(calculateSavings({ assets: 500, hourlyCost: 52 })).toEqual({
      hoursPerMonth: 125,
      dollarsPerYear: 78_000,
    })
  })

  it('returns 300 hours and $187,000 for 1200 assets at $52', () => {
    expect(calculateSavings({ assets: 1200, hourlyCost: 52 })).toEqual({
      hoursPerMonth: 300,
      dollarsPerYear: 187_000,
    })
  })

  it('returns 300 hours and $270,000 for 1200 assets at $75', () => {
    expect(calculateSavings({ assets: 1200, hourlyCost: 75 })).toEqual({
      hoursPerMonth: 300,
      dollarsPerYear: 270_000,
    })
  })

  it('returns 3 hours and $1,000 for 10 assets at $20, rounding 2.5 hours up and 600 dollars up', () => {
    expect(calculateSavings({ assets: 10, hourlyCost: 20 })).toEqual({
      hoursPerMonth: 3,
      dollarsPerYear: 1_000,
    })
  })

  it('returns 5,000 hours and $12,000,000 for 20,000 assets at $200', () => {
    expect(calculateSavings({ assets: 20_000, hourlyCost: 200 })).toEqual({
      hoursPerMonth: 5_000,
      dollarsPerYear: 12_000_000,
    })
  })

  it('returns 309 hours and $176,000 for 1234 assets at $47.50, using exact hours for the dollars', () => {
    expect(calculateSavings({ assets: 1234, hourlyCost: 47.5 })).toEqual({
      hoursPerMonth: 309,
      dollarsPerYear: 176_000,
    })
  })

  it('throws RangeError when assets is below the minimum of 10', () => {
    expect(() => calculateSavings({ assets: 9, hourlyCost: 52 })).toThrow(RangeError)
  })

  it('throws RangeError when assets is above the maximum of 20,000', () => {
    expect(() => calculateSavings({ assets: 20_001, hourlyCost: 52 })).toThrow(RangeError)
  })

  it('throws RangeError when hourlyCost is below the minimum of $20', () => {
    expect(() => calculateSavings({ assets: 500, hourlyCost: 19.99 })).toThrow(RangeError)
  })

  it('throws RangeError when hourlyCost is above the maximum of $200', () => {
    expect(() => calculateSavings({ assets: 500, hourlyCost: 200.01 })).toThrow(RangeError)
  })

  it('throws RangeError for non-finite inputs', () => {
    expect(() => calculateSavings({ assets: NaN, hourlyCost: 52 })).toThrow(RangeError)
    expect(() => calculateSavings({ assets: 500, hourlyCost: Infinity })).toThrow(RangeError)
  })

  it('rounds exact half-way yearly values up to the next $1,000', () => {
    expect(calculateSavings({ assets: 625, hourlyCost: 32.8 }).dollarsPerYear).toBe(62_000)
    expect(calculateSavings({ assets: 625, hourlyCost: 69.6 }).dollarsPerYear).toBe(131_000)
    expect(calculateSavings({ assets: 625, hourlyCost: 135.2 }).dollarsPerYear).toBe(254_000)
    expect(calculateSavings({ assets: 1250, hourlyCost: 34.8 }).dollarsPerYear).toBe(131_000)
  })
})
