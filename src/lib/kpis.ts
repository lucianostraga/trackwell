/** Headline numbers for the KPI row. */
import type { Asset } from '../types'
import { isTagOffline } from './tags'

export interface FleetKpis {
  tracked: number
  inUse: number
  available: number
  maintenance: number
  /** Assets whose tag has not reported for 30+ minutes. */
  tagsOffline: number
  /** Share (0-100) of tracked assets in use, or null with no assets. */
  inUseShare: number | null
  /** Number of zones with at least one asset. */
  zonesCovered: number
}

export function computeKpis(assets: readonly Asset[], now: Date): FleetKpis {
  const count = (status: Asset['status']) => assets.filter((a) => a.status === status).length
  const inUse = count('in-use')
  return {
    tracked: assets.length,
    inUse,
    available: count('available'),
    maintenance: count('maintenance'),
    tagsOffline: assets.filter((a) => isTagOffline(a, now)).length,
    inUseShare: assets.length ? (inUse / assets.length) * 100 : null,
    zonesCovered: new Set(assets.map((a) => a.zone)).size,
  }
}

export type TrendSentiment = 'positive' | 'negative' | 'neutral'

export interface KpiTrend {
  /** current - baseline */
  delta: number
  direction: 'up' | 'down' | 'flat'
  sentiment: TrendSentiment
}

/**
 * Compares the current value with a baseline (the same number a week ago). Changes smaller
 * than `epsilon` are flat; `betterWhen: 'neither'` keeps the sentiment neutral.
 */
export function compareToBaseline(
  current: number,
  baseline: number,
  betterWhen: 'up' | 'down' | 'neither',
  epsilon = 0.5,
): KpiTrend {
  const delta = current - baseline
  if (Math.abs(delta) < epsilon) return { delta: 0, direction: 'flat', sentiment: 'neutral' }
  const direction = delta > 0 ? 'up' : 'down'
  const sentiment = betterWhen === 'neither' ? 'neutral' : direction === betterWhen ? 'positive' : 'negative'
  return { delta, direction, sentiment }
}
