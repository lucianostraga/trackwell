import { describe, expect, it } from 'vitest'
import { createRng } from '../../src/lib/random'

describe('createRng', () => {
  it('is deterministic for a seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(Array.from({ length: 5 }, () => b.next()))
  })

  it('differs between seeds', () => {
    expect(createRng(1).next()).not.toBe(createRng(2).next())
  })

  it('returns floats in [0, 1)', () => {
    const rng = createRng(7)
    for (let i = 0; i < 1000; i++) {
      const v = rng.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('returns integers within inclusive bounds and covers them', () => {
    const rng = createRng(9)
    const seen = new Set<number>()
    for (let i = 0; i < 500; i++) {
      const v = rng.int(1, 3)
      expect([1, 2, 3]).toContain(v)
      seen.add(v)
    }
    expect(seen.size).toBe(3)
    expect(() => rng.int(3, 1)).toThrow(RangeError)
  })

  it('picks elements from a non-empty array', () => {
    const rng = createRng(3)
    expect(['a', 'b']).toContain(rng.pick(['a', 'b']))
    expect(() => rng.pick([])).toThrow(RangeError)
  })
})
