import type { Asset } from '../../src/types'

/** Fixed "now" for every time-dependent test. */
export const NOW = new Date('2026-10-29T15:00:00.000Z')

/** ISO timestamp `minutes` before NOW (negative = after NOW). */
export const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000).toISOString()

let sequence = 0

/** A small, valid asset; override only what a test cares about. */
export function makeAsset(overrides: Partial<Asset> = {}): Asset {
  sequence += 1
  const zoneEnteredAt = overrides.zoneEnteredAt ?? minutesAgo(60)
  return {
    id: `IP-${100 + sequence}`,
    name: `Infusion pump ${100 + sequence}`,
    type: 'infusion-pump',
    model: 'Test model',
    status: 'available',
    zone: 'icu',
    position: { x: 10, y: 45 },
    homeZone: 'icu',
    zoneEnteredAt,
    lastSeenAt: minutesAgo(1),
    batteryPct: 80,
    lastUseEndedAt: null,
    lastCleanedAt: null,
    usageMinutes24h: 0,
    history: [{ zone: overrides.zone ?? 'icu', enteredAt: zoneEnteredAt }],
    ...overrides,
  }
}
