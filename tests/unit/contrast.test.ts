import { describe, expect, it } from 'vitest'
import { contrastRatio, parseColor, relativeLuminance } from '../../src/lib/contrast'

describe('parseColor', () => {
  it('parses 3-digit hex colors', () => {
    expect(parseColor('#000')).toEqual([0, 0, 0])
    expect(parseColor('#fff')).toEqual([255, 255, 255])
    expect(parseColor('#abc')).toEqual([170, 187, 204])
  })

  it('parses 6-digit hex colors', () => {
    expect(parseColor('#0e8478')).toEqual([14, 132, 120])
  })

  it('parses uppercase hex colors', () => {
    expect(parseColor('#0E8478')).toEqual([14, 132, 120])
  })

  it('parses rgb() colors', () => {
    expect(parseColor('rgb(14, 26, 43)')).toEqual([14, 26, 43])
  })

  it('ignores the alpha in rgba() colors', () => {
    expect(parseColor('rgba(14, 26, 43, 0.5)')).toEqual([14, 26, 43])
  })

  it('parses space-separated rgb() colors with a slash alpha', () => {
    expect(parseColor('rgb(14 26 43 / 0.5)')).toEqual([14, 26, 43])
  })

  it('throws on a named color', () => {
    expect(() => parseColor('teal')).toThrow()
  })

  it('throws on the empty string', () => {
    expect(() => parseColor('')).toThrow()
  })

  it('throws on 2-digit hex', () => {
    expect(() => parseColor('#12')).toThrow()
  })

  it('throws on rgb() with too few channels', () => {
    expect(() => parseColor('rgb(1,2)')).toThrow()
  })
})

describe('relativeLuminance', () => {
  it('is 0 for black', () => {
    expect(relativeLuminance([0, 0, 0])).toBe(0)
  })

  it('is 1 for white', () => {
    expect(relativeLuminance([255, 255, 255])).toBe(1)
  })
})

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000', '#fff')).toBe(21)
  })

  it('is symmetric', () => {
    expect(contrastRatio('#fff', '#000')).toBe(21)
    expect(contrastRatio('#0e8478', '#fff')).toBe(contrastRatio('#fff', '#0e8478'))
  })

  it('is 1 for the same color', () => {
    expect(contrastRatio('#0e8478', '#0e8478')).toBe(1)
    expect(contrastRatio('rgb(14, 26, 43)', '#0e1a2b')).toBe(1)
  })

  it('is about 4.48 for #777 on white', () => {
    expect(contrastRatio('#777', '#fff')).toBeCloseTo(4.48, 2)
  })

  it('is always between 1 and 21', () => {
    const pairs: [string, string][] = [
      ['#000', '#fff'],
      ['#fff', '#000'],
      ['#0e8478', '#fff'],
      ['#777', '#111'],
      ['#fff', '#111'],
    ]
    for (const [foreground, background] of pairs) {
      const ratio = contrastRatio(foreground, background)
      expect(ratio).toBeGreaterThanOrEqual(1)
      expect(ratio).toBeLessThanOrEqual(21)
    }
  })
})
