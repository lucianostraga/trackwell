import { describe, expect, it } from 'vitest'
import { HOUR, MINUTE } from '../../src/lib/format'
import { locationStays, timeInCurrentZone } from '../../src/lib/location'
import { NOW, makeAsset, minutesAgo } from './fixtures'

describe('locationStays', () => {
  it('turns the history into stays, newest first, with how long each lasted', () => {
    const asset = makeAsset({
      zone: 'radiology',
      zoneEnteredAt: minutesAgo(14),
      history: [
        { zone: 'radiology', enteredAt: minutesAgo(14) },
        { zone: 'nurses-station', enteredAt: minutesAgo(18) },
        { zone: 'icu', enteredAt: minutesAgo(18 + 48 * 60) },
      ],
    })
    expect(locationStays(asset, NOW)).toEqual([
      { zone: 'radiology', enteredAt: minutesAgo(14), leftAt: null, durationMs: 14 * MINUTE, current: true },
      { zone: 'nurses-station', enteredAt: minutesAgo(18), leftAt: minutesAgo(14), durationMs: 4 * MINUTE, current: false },
      { zone: 'icu', enteredAt: minutesAgo(18 + 48 * 60), leftAt: minutesAgo(18), durationMs: 48 * HOUR, current: false },
    ])
  })

  it('handles an empty history', () => {
    expect(locationStays(makeAsset({ history: [] }), NOW)).toEqual([])
  })
})

describe('timeInCurrentZone', () => {
  it('is the time since the asset entered its zone, never negative', () => {
    expect(timeInCurrentZone({ zoneEnteredAt: minutesAgo(205) }, NOW)).toBe(205 * MINUTE)
    expect(timeInCurrentZone({ zoneEnteredAt: minutesAgo(-1) }, NOW)).toBe(0)
  })
})
