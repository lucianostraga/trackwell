import { describe, expect, it } from 'vitest'
import { publicAsset, withBase } from '../../src/lib/assets'

describe('withBase', () => {
  it.each([
    ['/', 'product-floorplan.png', '/product-floorplan.png'],
    ['/trackwell/', 'product-floorplan.png', '/trackwell/product-floorplan.png'],
    ['/trackwell/preview/pr-12/', '/favicon.svg', '/trackwell/preview/pr-12/favicon.svg'],
    ['/trackwell', 'favicon.svg', '/trackwell/favicon.svg'],
  ])('withBase(%s, %s) -> %s', (base, file, expected) => {
    expect(withBase(base, file)).toBe(expected)
  })
})

describe('publicAsset', () => {
  it('uses the build base path (the site root in tests)', () => {
    expect(publicAsset('product-floorplan.png')).toBe('/product-floorplan.png')
  })
})
