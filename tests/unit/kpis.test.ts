import { describe, expect, it } from 'vitest'
import { compareToBaseline, computeKpis } from '../../src/lib/kpis'
import { NOW, makeAsset, minutesAgo } from './fixtures'

describe('computeKpis', () => {
  it('counts the fleet by status, offline tags and covered zones', () => {
    const assets = [
      makeAsset({ status: 'in-use', zone: 'icu' }),
      makeAsset({ status: 'in-use', zone: 'icu', lastSeenAt: minutesAgo(31) }),
      makeAsset({ status: 'available', zone: 'ward-a' }),
      makeAsset({ status: 'maintenance', zone: 'central-supply', lastSeenAt: minutesAgo(90) }),
    ]
    expect(computeKpis(assets, NOW)).toEqual({
      tracked: 4,
      inUse: 2,
      available: 1,
      maintenance: 1,
      tagsOffline: 2,
      inUseShare: 50,
      zonesCovered: 3,
    })
  })

  it('handles an empty fleet', () => {
    expect(computeKpis([], NOW)).toMatchObject({ tracked: 0, inUseShare: null, zonesCovered: 0 })
  })
})

describe('compareToBaseline', () => {
  it('flags good and bad changes by the better direction', () => {
    expect(compareToBaseline(60, 57, 'up')).toEqual({ delta: 3, direction: 'up', sentiment: 'positive' })
    expect(compareToBaseline(4, 6, 'down')).toEqual({ delta: -2, direction: 'down', sentiment: 'positive' })
    expect(compareToBaseline(8, 6, 'down')).toEqual({ delta: 2, direction: 'up', sentiment: 'negative' })
  })

  it('keeps neutral metrics neutral and small changes flat', () => {
    expect(compareToBaseline(28, 24, 'neither')).toEqual({ delta: 4, direction: 'up', sentiment: 'neutral' })
    expect(compareToBaseline(10.2, 10, 'up')).toEqual({ delta: 0, direction: 'flat', sentiment: 'neutral' })
  })
})
