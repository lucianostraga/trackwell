/** Search and filters of the equipment list (also applied to the floor plan). */
import type { Asset, AssetStatus, AssetType } from '../types'
import { STATUS_ORDER, TYPE_ORDER } from './labels'

export interface AssetFilters {
  query: string
  type: AssetType | 'all'
  status: AssetStatus | 'all'
}

export const NO_FILTERS: AssetFilters = { query: '', type: 'all', status: 'all' }

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * Case-insensitive match on name or ID that ignores spaces and dashes:
 * "ip104", "IP-104" and "pump 104" all find "Infusion pump 104" (IP-104).
 */
export function matchesQuery(asset: Pick<Asset, 'id' | 'name'>, query: string): boolean {
  const q = normalize(query)
  if (q === '') return true
  return normalize(asset.id).includes(q) || normalize(asset.name).includes(q)
}

export function matchesFilters(asset: Asset, filters: AssetFilters): boolean {
  return (
    (filters.type === 'all' || asset.type === filters.type) &&
    (filters.status === 'all' || asset.status === filters.status) &&
    matchesQuery(asset, filters.query)
  )
}

/** Matching assets in list order: by type, then by ID. */
export function filterAssets(assets: readonly Asset[], filters: AssetFilters): Asset[] {
  return sortAssets(assets.filter((a) => matchesFilters(a, filters)))
}

export function sortAssets(assets: readonly Asset[]): Asset[] {
  return [...assets].sort(
    (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || a.id.localeCompare(b.id, 'en', { numeric: true }),
  )
}

export function hasActiveFilters(filters: AssetFilters): boolean {
  return filters.query.trim() !== '' || filters.type !== 'all' || filters.status !== 'all'
}

/** Counts for the status tabs: "all" plus each status. */
export function countByStatus(assets: readonly Asset[]): Record<AssetStatus | 'all', number> {
  const counts = { all: assets.length } as Record<AssetStatus | 'all', number>
  for (const status of STATUS_ORDER) counts[status] = assets.filter((a) => a.status === status).length
  return counts
}

export function countByType(assets: readonly Asset[]): Record<AssetType, number> {
  const counts = {} as Record<AssetType, number>
  for (const type of TYPE_ORDER) counts[type] = assets.filter((a) => a.type === type).length
  return counts
}
