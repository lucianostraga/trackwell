import { describe, expect, it } from 'vitest'
import { isTagOffline, minutesSinceSeen, OFFLINE_AFTER_MINUTES, offlineAssets } from '../../src/lib/tags'
import { NOW, makeAsset, minutesAgo } from './fixtures'

describe('isTagOffline', () => {
  it('is offline from 30 minutes without a report', () => {
    expect(OFFLINE_AFTER_MINUTES).toBe(30)
    expect(isTagOffline({ lastSeenAt: minutesAgo(29.99) }, NOW)).toBe(false)
    expect(isTagOffline({ lastSeenAt: minutesAgo(30) }, NOW)).toBe(true)
    expect(isTagOffline({ lastSeenAt: minutesAgo(400) }, NOW)).toBe(true)
  })

  it('treats a report in the future as online', () => {
    expect(isTagOffline({ lastSeenAt: minutesAgo(-5) }, NOW)).toBe(false)
  })
})

describe('minutesSinceSeen', () => {
  it('is whole minutes and never negative', () => {
    expect(minutesSinceSeen({ lastSeenAt: minutesAgo(47.8) }, NOW)).toBe(47)
    expect(minutesSinceSeen({ lastSeenAt: minutesAgo(-3) }, NOW)).toBe(0)
  })
})

describe('offlineAssets', () => {
  it('lists offline tags, silent the longest first', () => {
    const assets = [
      makeAsset({ id: 'A-1', lastSeenAt: minutesAgo(35) }),
      makeAsset({ id: 'A-2', lastSeenAt: minutesAgo(2) }),
      makeAsset({ id: 'A-3', lastSeenAt: minutesAgo(300) }),
    ]
    expect(offlineAssets(assets, NOW).map((a) => a.id)).toEqual(['A-3', 'A-1'])
  })
})
