/** Location history: how long an asset stayed in each zone. */
import type { Asset, ZoneId } from '../types'
import { msBetween } from './format'

export interface LocationStay {
  zone: ZoneId
  enteredAt: string
  /** When it moved to the next zone; null for the current zone. */
  leftAt: string | null
  /** Time spent in the zone (until `now` for the current one). */
  durationMs: number
  current: boolean
}

/** The asset's history, newest first, with the time spent in each zone. */
export function locationStays(asset: Pick<Asset, 'history'>, now: Date): LocationStay[] {
  return asset.history.map((entry, i) => {
    const leftAt = i === 0 ? null : asset.history[i - 1]!.enteredAt
    return {
      zone: entry.zone,
      enteredAt: entry.enteredAt,
      leftAt,
      durationMs: Math.max(0, msBetween(entry.enteredAt, leftAt ?? now)),
      current: i === 0,
    }
  })
}

/** Time since the asset entered its current zone. */
export function timeInCurrentZone(asset: Pick<Asset, 'zoneEnteredAt'>, now: Date): number {
  return Math.max(0, msBetween(asset.zoneEnteredAt, now))
}
