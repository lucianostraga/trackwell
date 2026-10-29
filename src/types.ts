/** Domain model. Positions are in floor-plan meters: x grows to the east, y to the south. */

export type AssetType =
  | 'infusion-pump'
  | 'wheelchair'
  | 'patient-monitor'
  | 'ventilator'
  | 'hospital-bed'
  | 'defibrillator'
  | 'portable-ultrasound'

export type AssetStatus = 'in-use' | 'available' | 'maintenance'

export type ZoneId =
  | 'emergency'
  | 'icu'
  | 'radiology'
  | 'operating-rooms'
  | 'ward-a'
  | 'ward-b'
  | 'pharmacy'
  | 'central-supply'
  | 'sterile-processing'
  | 'nurses-station'

export interface Point {
  x: number
  y: number
}

export interface Zone {
  id: ZoneId
  name: string
  /** Outline in floor-plan meters, clockwise. */
  polygon: readonly Point[]
}

export interface LocationEntry {
  zone: ZoneId
  /** ISO timestamp when the tag was first seen in this zone. */
  enteredAt: string
}

export interface Asset {
  /** e.g. "IP-104", "WC-12", "VT-03". */
  id: string
  name: string
  type: AssetType
  /** Manufacturer model (fictional). */
  model: string
  status: AssetStatus
  /** Zone where the tag is (or was last seen). */
  zone: ZoneId
  /** Position in floor-plan meters, inside `zone`. */
  position: Point
  /** Department that owns the asset. */
  homeZone: ZoneId
  /** ISO timestamp when the asset entered `zone`. */
  zoneEnteredAt: string
  /** ISO timestamp of the tag's last report. */
  lastSeenAt: string
  /** Tag battery, 0-100. */
  batteryPct: number
  /** ISO timestamp when the last use ended, or null if no use is recorded. */
  lastUseEndedAt: string | null
  /** ISO timestamp of the last cleaning, or null if none is recorded. */
  lastCleanedAt: string | null
  /** Minutes in use during the last 24 hours (0-1440). */
  usageMinutes24h: number
  /** Recent zones, newest first; the first entry is the current zone. */
  history: readonly LocationEntry[]
}
