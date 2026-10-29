/** The Alerts panel: one alert per condition worth a look. */
import type { Asset } from '../types'
import { offlineAssets } from './tags'

export type AlertKind = 'tag-offline'

export interface Alert {
  /** Stable id, e.g. "tag-offline:WC-02". */
  id: string
  kind: AlertKind
  assetId: string
  /** ISO timestamp the condition started from (for a silent tag, its last report). */
  since: string
}

export const ALERT_LABEL: Record<AlertKind, string> = {
  'tag-offline': 'Tag offline',
}

/** Alerts as of `now`: today, one per offline tag, the longest silent first. */
export function buildAlerts(assets: readonly Asset[], now: Date): Alert[] {
  return offlineAssets(assets, now).map((asset) => ({
    id: `tag-offline:${asset.id}`,
    kind: 'tag-offline' as const,
    assetId: asset.id,
    since: asset.lastSeenAt,
  }))
}
