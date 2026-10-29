/** Tag connectivity: a tag that has not reported for 30 minutes or more is offline. */
import type { Asset } from '../types'
import { MINUTE, msBetween } from './format'

export const OFFLINE_AFTER_MINUTES = 30

/** Whole minutes since the tag last reported (never negative). */
export function minutesSinceSeen(asset: Pick<Asset, 'lastSeenAt'>, now: Date): number {
  return Math.max(0, Math.floor(msBetween(asset.lastSeenAt, now) / MINUTE))
}

export function isTagOffline(asset: Pick<Asset, 'lastSeenAt'>, now: Date): boolean {
  return msBetween(asset.lastSeenAt, now) >= OFFLINE_AFTER_MINUTES * MINUTE
}

/** Assets whose tag is offline, silent the longest first. */
export function offlineAssets(assets: readonly Asset[], now: Date): Asset[] {
  return assets
    .filter((a) => isTagOffline(a, now))
    .sort((a, b) => a.lastSeenAt.localeCompare(b.lastSeenAt) || a.id.localeCompare(b.id))
}
