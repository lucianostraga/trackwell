import { describe, expect, it } from 'vitest'
import { FLOOR, ZONES } from '../../src/data/floor'
import { countByZone, isInZone, zoneAt, zoneById, zoneCenter, zoneName } from '../../src/lib/zones'
import { makeAsset } from './fixtures'

describe('zone lookup', () => {
  it('finds zones by id and names them', () => {
    expect(zoneById('icu')?.name).toBe('ICU')
    expect(zoneName('ward-a')).toBe('Ward A')
    expect(zoneName('nurses-station')).toBe("Nurses' Station & Corridor")
  })

  it('has ten zones with unique ids inside the building', () => {
    expect(ZONES).toHaveLength(10)
    expect(new Set(ZONES.map((z) => z.id)).size).toBe(10)
    const b = FLOOR.building
    for (const zone of ZONES) {
      for (const p of zone.polygon) {
        expect(p.x).toBeGreaterThanOrEqual(b.x)
        expect(p.x).toBeLessThanOrEqual(b.x + b.width)
        expect(p.y).toBeGreaterThanOrEqual(b.y)
        expect(p.y).toBeLessThanOrEqual(b.y + b.height)
      }
    }
  })
})

describe('zoneAt and isInZone', () => {
  it('returns the zone that contains a point', () => {
    expect(zoneAt({ x: 10, y: 10 })?.id).toBe('emergency')
    expect(zoneAt({ x: 60, y: 30.5 })?.id).toBe('nurses-station')
    expect(zoneAt({ x: 110, y: 50 })?.id).toBe('central-supply')
  })

  it('returns null outside the building', () => {
    expect(zoneAt({ x: 1, y: 1 })).toBeNull()
    expect(zoneAt({ x: 119, y: 61 })).toBeNull()
  })

  it('checks one zone', () => {
    const icu = zoneById('icu')!
    expect(isInZone({ x: 10, y: 50 }, icu)).toBe(true)
    expect(isInZone({ x: 50, y: 50 }, icu)).toBe(false)
  })

  it('computes the center of a zone', () => {
    expect(zoneCenter(zoneById('emergency')!)).toEqual({ x: 19, y: 15 })
  })
})

describe('countByZone', () => {
  it('counts assets per zone, with zeros for empty zones', () => {
    const counts = countByZone([makeAsset({ zone: 'icu' }), makeAsset({ zone: 'icu' }), makeAsset({ zone: 'pharmacy' })])
    expect(counts.icu).toBe(2)
    expect(counts.pharmacy).toBe(1)
    expect(counts.emergency).toBe(0)
    expect(Object.keys(counts)).toHaveLength(10)
  })
})
