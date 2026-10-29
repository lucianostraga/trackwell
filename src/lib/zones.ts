/** Zones of the floor: lookup, point-in-zone and per-zone counts. */
import { ZONES } from '../data/floor'
import type { Asset, Point, Zone, ZoneId } from '../types'
import { pointInPolygon, polygonCentroid } from './geometry'

export function zoneById(id: ZoneId, zones: readonly Zone[] = ZONES): Zone | undefined {
  return zones.find((z) => z.id === id)
}

/** Display name of a zone, e.g. "Ward A". Unknown ids are returned as they are. */
export function zoneName(id: ZoneId, zones: readonly Zone[] = ZONES): string {
  return zoneById(id, zones)?.name ?? id
}

export function isInZone(point: Point, zone: Zone): boolean {
  return pointInPolygon(point, zone.polygon)
}

/** The first zone that contains the point, or null when it is outside every zone. */
export function zoneAt(point: Point, zones: readonly Zone[] = ZONES): Zone | null {
  return zones.find((z) => isInZone(point, z)) ?? null
}

export function zoneCenter(zone: Zone): Point {
  return polygonCentroid(zone.polygon)
}

/** Number of assets currently in each zone (zones without assets get 0). */
export function countByZone(assets: readonly Asset[], zones: readonly Zone[] = ZONES): Record<ZoneId, number> {
  const counts = Object.fromEntries(zones.map((z) => [z.id, 0])) as Record<ZoneId, number>
  for (const asset of assets) counts[asset.zone] = (counts[asset.zone] ?? 0) + 1
  return counts
}
