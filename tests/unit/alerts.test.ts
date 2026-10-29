import { describe, expect, it } from 'vitest'
import { ALERT_LABEL, buildAlerts } from '../../src/lib/alerts'
import { NOW, makeAsset, minutesAgo } from './fixtures'

describe('buildAlerts', () => {
  it('raises one "Tag offline" alert per offline tag, the longest silent first', () => {
    const assets = [
      makeAsset({ id: 'WC-1', lastSeenAt: minutesAgo(45) }),
      makeAsset({ id: 'WC-2', lastSeenAt: minutesAgo(5) }),
      makeAsset({ id: 'WC-3', lastSeenAt: minutesAgo(120) }),
    ]
    expect(buildAlerts(assets, NOW)).toEqual([
      { id: 'tag-offline:WC-3', kind: 'tag-offline', assetId: 'WC-3', since: minutesAgo(120) },
      { id: 'tag-offline:WC-1', kind: 'tag-offline', assetId: 'WC-1', since: minutesAgo(45) },
    ])
    expect(ALERT_LABEL['tag-offline']).toBe('Tag offline')
  })

  it('is empty when every tag reports', () => {
    expect(buildAlerts([makeAsset(), makeAsset()], NOW)).toEqual([])
  })

  it('depends on now', () => {
    const asset = makeAsset({ lastSeenAt: minutesAgo(20) })
    expect(buildAlerts([asset], NOW)).toHaveLength(0)
    expect(buildAlerts([asset], new Date(NOW.getTime() + 10 * 60_000))).toHaveLength(1)
  })
})
