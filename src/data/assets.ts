import { assetName } from '../lib/labels'
import { createRng } from '../lib/random'
import type { Asset, LocationEntry, ZoneId } from '../types'
import { ASSET_BLUEPRINTS, type AssetBlueprint } from './asset-blueprints'

const MINUTE = 60_000

/**
 * Earlier zones for blueprints without an explicit trail: the corridor a few minutes
 * before the current zone, and the department it came from before that (seeded).
 */
function generatedTrail(b: AssetBlueprint, index: number): ReadonlyArray<readonly [ZoneId, number]> {
  if (b.trail) return b.trail
  const rng = createRng(1009 + index * 7919)
  if (b.zone === 'nurses-station') return [[b.home, b.inZone + rng.int(30, 600)]]
  const viaCorridor = b.inZone + rng.int(2, 7)
  const origin: ZoneId =
    b.zone !== b.home ? b.home : b.home === 'central-supply' ? 'sterile-processing' : 'central-supply'
  return [
    ['nurses-station', viaCorridor],
    [origin, viaCorridor + rng.int(40, 900)],
  ]
}

/**
 * Builds the 60 tracked assets with timestamps relative to `now` (page load), so ages
 * move live while the data stays identical on every load.
 */
export function buildAssets(now: Date): Asset[] {
  const ago = (minutes: number) => new Date(now.getTime() - Math.round(minutes * MINUTE)).toISOString()
  return ASSET_BLUEPRINTS.map((b, index) => {
    const history: LocationEntry[] = [
      { zone: b.zone, enteredAt: ago(b.inZone) },
      ...generatedTrail(b, index).map(([zone, minutes]) => ({ zone, enteredAt: ago(minutes) })),
    ]
    return {
      id: b.id,
      name: assetName(b.type, b.id),
      type: b.type,
      model: b.model,
      status: b.status,
      zone: b.zone,
      position: { x: b.at[0], y: b.at[1] },
      homeZone: b.home,
      zoneEnteredAt: ago(b.inZone),
      lastSeenAt: ago(b.seen),
      batteryPct: b.battery,
      lastUseEndedAt: b.useEnded === null ? null : ago(b.useEnded),
      lastCleanedAt: b.cleaned === null ? null : ago(b.cleaned),
      usageMinutes24h: b.usage,
      history,
    }
  })
}
