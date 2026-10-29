import { describe, expect, it } from 'vitest'
import {
  IDENTITY_VIEW,
  applyView,
  clamp,
  distance,
  focusTransform,
  pointInPolygon,
  polygonBounds,
  polygonCentroid,
} from '../../src/lib/geometry'

const square = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
]
const lShape = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 4 },
  { x: 4, y: 4 },
  { x: 4, y: 10 },
  { x: 0, y: 10 },
]

describe('distance', () => {
  it('is the straight-line distance in meters', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
    expect(distance({ x: 2, y: 2 }, { x: 2, y: 2 })).toBe(0)
  })

  it('is symmetric', () => {
    const a = { x: 1.5, y: -2 }
    const b = { x: -7, y: 9.25 }
    expect(distance(a, b)).toBeCloseTo(distance(b, a), 12)
  })
})

describe('pointInPolygon', () => {
  it('finds points inside and outside a rectangle', () => {
    expect(pointInPolygon({ x: 5, y: 5 }, square)).toBe(true)
    expect(pointInPolygon({ x: 11, y: 5 }, square)).toBe(false)
    expect(pointInPolygon({ x: 5, y: -0.01 }, square)).toBe(false)
  })

  it('counts points on an edge or a corner as inside', () => {
    expect(pointInPolygon({ x: 0, y: 5 }, square)).toBe(true)
    expect(pointInPolygon({ x: 10, y: 10 }, square)).toBe(true)
  })

  it('handles concave shapes', () => {
    expect(pointInPolygon({ x: 2, y: 8 }, lShape)).toBe(true)
    expect(pointInPolygon({ x: 8, y: 2 }, lShape)).toBe(true)
    expect(pointInPolygon({ x: 8, y: 8 }, lShape)).toBe(false)
  })

  it('rejects degenerate polygons', () => {
    expect(pointInPolygon({ x: 0, y: 0 }, square.slice(0, 2))).toBe(false)
  })
})

describe('polygonBounds and polygonCentroid', () => {
  it('measures a rectangle', () => {
    expect(polygonBounds(square)).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 10 })
    expect(polygonCentroid(square)).toEqual({ x: 5, y: 5 })
  })

  it('weights the centroid by area', () => {
    const c = polygonCentroid(lShape)
    expect(c.x).toBeCloseTo(3.875, 6)
    expect(c.y).toBeCloseTo(3.875, 6)
  })

  it('falls back to the vertex average for a degenerate polygon', () => {
    expect(polygonCentroid([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 8, y: 0 }])).toEqual({ x: 4, y: 0 })
  })
})

describe('focusTransform', () => {
  const view = { width: 120, height: 62 }

  it('centers the point when there is room', () => {
    const t = focusTransform({ x: 60, y: 31 }, view, 2)
    expect(applyView({ x: 60, y: 31 }, t)).toEqual({ x: 60, y: 31 })
  })

  it('never shows anything outside the view', () => {
    const corner = focusTransform({ x: 1, y: 1 }, view, 2)
    expect(corner).toEqual({ scale: 2, x: 0, y: 0 })
    const far = focusTransform({ x: 119, y: 61 }, view, 2)
    expect(far).toEqual({ scale: 2, x: -120, y: -62 })
  })

  it('is the identity at scale 1 or below', () => {
    expect(focusTransform({ x: 10, y: 10 }, view, 1)).toBe(IDENTITY_VIEW)
  })
})

describe('clamp', () => {
  it('limits a value to a range', () => {
    expect(clamp(5, 0, 3)).toBe(3)
    expect(clamp(-1, 0, 3)).toBe(0)
    expect(clamp(2, 0, 3)).toBe(2)
  })
})
