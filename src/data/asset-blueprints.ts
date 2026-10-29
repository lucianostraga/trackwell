import type { AssetStatus, AssetType, ZoneId } from '../types'

/**
 * The 60 tracked assets on Level 2. Times are minutes before page load, so the
 * dashboard looks live; `buildAssets(now)` turns them into ISO timestamps.
 */
export interface AssetBlueprint {
  id: string
  type: AssetType
  model: string
  status: AssetStatus
  zone: ZoneId
  /** Position in floor-plan meters [x, y]. */
  at: readonly [number, number]
  home: ZoneId
  /** Minutes since the asset entered `zone`. */
  inZone: number
  /** Minutes since the tag last reported. */
  seen: number
  battery: number
  /** Minutes since the last use ended, or null. */
  useEnded: number | null
  /** Minutes since the last cleaning, or null. */
  cleaned: number | null
  /** Minutes in use during the last 24 hours. */
  usage: number
  /** Earlier zones, newest first, as [zone, minutes since entering]. Generated when omitted. */
  trail?: ReadonlyArray<readonly [ZoneId, number]>
}

const PUMP = 'Fluvia 300'
const PUMP_DUAL = 'Fluvia 300 Dual'
const CHAIR = 'Kestrel T18 Transport'
const CHAIR_XL = 'Kestrel B24 Bariatric'
const MONITOR = 'Halden M8'
const MONITOR_TRANSPORT = 'Halden M12 Transport'
const VENT = 'Brisa V700'
const VENT_TRANSPORT = 'Brisa V900 Transport'
const BED_ICU = 'Corvan ICU-4'
const BED = 'Corvan Care 2'
const DEFIB = 'Pulsewise D5'
const ULTRASOUND = 'Sonera P5'

export const ASSET_BLUEPRINTS: readonly AssetBlueprint[] = [
  // Emergency
  { id: 'HB-08', type: 'hospital-bed', model: BED, status: 'in-use', zone: 'emergency', at: [20.1, 6.6], home: 'emergency', inZone: 95, seen: 0.3, battery: 54, useEnded: 600, cleaned: 560, usage: 1120 },
  { id: 'PM-05', type: 'patient-monitor', model: MONITOR, status: 'in-use', zone: 'emergency', at: [24.4, 6.6], home: 'emergency', inZone: 240, seen: 0.2, battery: 90, useEnded: 420, cleaned: 300, usage: 720 },
  { id: 'VT-05', type: 'ventilator', model: VENT_TRANSPORT, status: 'in-use', zone: 'emergency', at: [28.6, 6.6], home: 'icu', inZone: 205, seen: 0.4, battery: 49, useEnded: 2900, cleaned: 2800, usage: 980, trail: [['nurses-station', 211], ['icu', 4300]] },
  { id: 'IP-103', type: 'infusion-pump', model: PUMP, status: 'in-use', zone: 'emergency', at: [32.9, 6.6], home: 'emergency', inZone: 310, seen: 0.1, battery: 91, useEnded: 700, cleaned: 640, usage: 815 },
  { id: 'IP-101', type: 'infusion-pump', model: PUMP, status: 'in-use', zone: 'emergency', at: [10, 14], home: 'emergency', inZone: 150, seen: 0.5, battery: 82, useEnded: 480, cleaned: 420, usage: 640 },
  { id: 'DF-01', type: 'defibrillator', model: DEFIB, status: 'available', zone: 'emergency', at: [31.5, 16], home: 'emergency', inZone: 12000, seen: 0.6, battery: 99, useEnded: 7200, cleaned: 7150, usage: 0 },
  { id: 'WC-03', type: 'wheelchair', model: CHAIR, status: 'available', zone: 'emergency', at: [6.5, 23.5], home: 'emergency', inZone: 70, seen: 0.2, battery: 84, useEnded: 15, cleaned: 2880, usage: 210 },
  { id: 'US-03', type: 'portable-ultrasound', model: ULTRASOUND, status: 'available', zone: 'emergency', at: [24.5, 21.5], home: 'emergency', inZone: 180, seen: 0.3, battery: 59, useEnded: 25, cleaned: 300, usage: 190 },
  { id: 'IP-102', type: 'infusion-pump', model: PUMP_DUAL, status: 'maintenance', zone: 'emergency', at: [15, 23.5], home: 'emergency', inZone: 520, seen: 0.8, battery: 64, useEnded: 70, cleaned: 900, usage: 410 },

  // Radiology
  { id: 'VT-02', type: 'ventilator', model: VENT_TRANSPORT, status: 'in-use', zone: 'radiology', at: [49.5, 12.3], home: 'icu', inZone: 14, seen: 0.1, battery: 63, useEnded: 3100, cleaned: 3000, usage: 1385, trail: [['nurses-station', 18], ['icu', 2950]] },
  { id: 'PM-08', type: 'patient-monitor', model: MONITOR_TRANSPORT, status: 'in-use', zone: 'radiology', at: [53.5, 12.3], home: 'icu', inZone: 14, seen: 0.2, battery: 55, useEnded: 1900, cleaned: 1850, usage: 1120, trail: [['nurses-station', 18], ['icu', 1500]] },
  { id: 'IP-114', type: 'infusion-pump', model: PUMP, status: 'available', zone: 'radiology', at: [38.5, 15], home: 'central-supply', inZone: 260, seen: 0.4, battery: 17, useEnded: 250, cleaned: 230, usage: 330 },
  { id: 'DF-04', type: 'defibrillator', model: DEFIB, status: 'available', zone: 'radiology', at: [41.5, 22.5], home: 'icu', inZone: 52, seen: 0.3, battery: 45, useEnded: null, cleaned: 20000, usage: 0, trail: [['nurses-station', 55], ['icu', 6000]] },

  // Operating Rooms
  { id: 'IP-105', type: 'infusion-pump', model: PUMP_DUAL, status: 'in-use', zone: 'operating-rooms', at: [64.3, 15.5], home: 'operating-rooms', inZone: 130, seen: 0.2, battery: 73, useEnded: 500, cleaned: 440, usage: 365 },
  { id: 'IP-116', type: 'infusion-pump', model: PUMP, status: 'in-use', zone: 'operating-rooms', at: [75.6, 15.5], home: 'operating-rooms', inZone: 75, seen: 0.5, battery: 95, useEnded: 900, cleaned: 820, usage: 290 },
  { id: 'PM-10', type: 'patient-monitor', model: MONITOR, status: 'in-use', zone: 'operating-rooms', at: [86.9, 15.5], home: 'operating-rooms', inZone: 160, seen: 0.3, battery: 81, useEnded: 380, cleaned: 350, usage: 845 },

  // Sterile Processing
  { id: 'IP-113', type: 'infusion-pump', model: PUMP, status: 'available', zone: 'sterile-processing', at: [99, 17], home: 'ward-b', inZone: 45, seen: 0.2, battery: 77, useEnded: 180, cleaned: 20, usage: 240, trail: [['nurses-station', 49], ['ward-b', 800]] },
  { id: 'US-04', type: 'portable-ultrasound', model: ULTRASOUND, status: 'available', zone: 'sterile-processing', at: [104, 21], home: 'radiology', inZone: 60, seen: 0.4, battery: 94, useEnded: 240, cleaned: 35, usage: 95 },

  // Nurses' Station & Corridor
  { id: 'IP-108', type: 'infusion-pump', model: PUMP, status: 'available', zone: 'nurses-station', at: [13, 30.5], home: 'central-supply', inZone: 90, seen: 0.3, battery: 88, useEnded: 300, cleaned: 200, usage: 180 },
  { id: 'WC-02', type: 'wheelchair', model: CHAIR, status: 'available', zone: 'nurses-station', at: [22, 32.4], home: 'emergency', inZone: 120, seen: 47, battery: 41, useEnded: 200, cleaned: 150, usage: 60, trail: [['emergency', 260]] },
  { id: 'WC-01', type: 'wheelchair', model: CHAIR, status: 'in-use', zone: 'nurses-station', at: [31, 28.6], home: 'emergency', inZone: 2, seen: 0.1, battery: 71, useEnded: 330, cleaned: 310, usage: 145, trail: [['emergency', 40], ['nurses-station', 46], ['central-supply', 400]] },
  { id: 'WC-04', type: 'wheelchair', model: CHAIR_XL, status: 'in-use', zone: 'nurses-station', at: [40, 32.4], home: 'emergency', inZone: 1, seen: 0.1, battery: 57, useEnded: 500, cleaned: 470, usage: 95, trail: [['radiology', 35], ['nurses-station', 38], ['emergency', 180]] },
  { id: 'DF-03', type: 'defibrillator', model: DEFIB, status: 'available', zone: 'nurses-station', at: [47, 28.6], home: 'operating-rooms', inZone: 550, seen: 0.5, battery: 11, useEnded: 10000, cleaned: 9950, usage: 0, trail: [['operating-rooms', 4100]] },
  { id: 'PM-03', type: 'patient-monitor', model: MONITOR, status: 'available', zone: 'nurses-station', at: [67.8, 30.5], home: 'ward-a', inZone: 200, seen: 0.2, battery: 44, useEnded: 260, cleaned: 210, usage: 380 },
  { id: 'HB-04', type: 'hospital-bed', model: BED, status: 'in-use', zone: 'nurses-station', at: [76, 32.4], home: 'ward-a', inZone: 3, seen: 0.1, battery: 85, useEnded: 4000, cleaned: 3900, usage: 1310, trail: [['ward-a', 2200]] },
  { id: 'WC-05', type: 'wheelchair', model: CHAIR, status: 'available', zone: 'nurses-station', at: [86, 32.4], home: 'central-supply', inZone: 330, seen: 0.6, battery: 93, useEnded: 400, cleaned: 345, usage: 40 },
  { id: 'HB-07', type: 'hospital-bed', model: BED, status: 'available', zone: 'nurses-station', at: [97, 30.5], home: 'ward-b', inZone: 170, seen: 0.4, battery: 70, useEnded: 180, cleaned: null, usage: 1260, trail: [['ward-b', 3000]] },

  // ICU
  { id: 'HB-01', type: 'hospital-bed', model: BED_ICU, status: 'in-use', zone: 'icu', at: [5.3, 56.2], home: 'icu', inZone: 5400, seen: 0.2, battery: 96, useEnded: 6000, cleaned: 5500, usage: 1440 },
  { id: 'VT-01', type: 'ventilator', model: VENT, status: 'in-use', zone: 'icu', at: [5.3, 52.6], home: 'icu', inZone: 5300, seen: 0.3, battery: 92, useEnded: 7000, cleaned: 6900, usage: 1440 },
  { id: 'PM-01', type: 'patient-monitor', model: MONITOR, status: 'in-use', zone: 'icu', at: [9.9, 56.2], home: 'icu', inZone: 8000, seen: 0.1, battery: 86, useEnded: 2600, cleaned: 2550, usage: 1440 },
  { id: 'IP-104', type: 'infusion-pump', model: PUMP_DUAL, status: 'in-use', zone: 'icu', at: [9.9, 52.6], home: 'icu', inZone: 1300, seen: 0.4, battery: 47, useEnded: 1500, cleaned: 1400, usage: 1180 },
  { id: 'HB-02', type: 'hospital-bed', model: BED_ICU, status: 'in-use', zone: 'icu', at: [14.6, 56.2], home: 'icu', inZone: 9000, seen: 0.3, battery: 78, useEnded: 3000, cleaned: 2950, usage: 1440 },
  { id: 'VT-03', type: 'ventilator', model: VENT, status: 'in-use', zone: 'icu', at: [14.6, 52.6], home: 'icu', inZone: 2100, seen: 0.2, battery: 74, useEnded: 2300, cleaned: 2200, usage: 1310 },
  { id: 'PM-02', type: 'patient-monitor', model: MONITOR, status: 'in-use', zone: 'icu', at: [19.2, 56.2], home: 'icu', inZone: 6100, seen: 0.5, battery: 69, useEnded: 1700, cleaned: 1650, usage: 1265 },
  { id: 'VT-04', type: 'ventilator', model: VENT, status: 'in-use', zone: 'icu', at: [23.8, 56.2], home: 'icu', inZone: 4400, seen: 0.3, battery: 12, useEnded: 5000, cleaned: 4900, usage: 1440 },
  { id: 'PM-04', type: 'patient-monitor', model: MONITOR, status: 'in-use', zone: 'icu', at: [23.8, 52.6], home: 'icu', inZone: 4400, seen: 0.2, battery: 20, useEnded: 4600, cleaned: 4500, usage: 1440 },
  { id: 'IP-106', type: 'infusion-pump', model: PUMP, status: 'in-use', zone: 'icu', at: [28.4, 56.2], home: 'icu', inZone: 900, seen: 28, battery: 58, useEnded: 1000, cleaned: 950, usage: 1020 },
  { id: 'US-02', type: 'portable-ultrasound', model: ULTRASOUND, status: 'in-use', zone: 'icu', at: [28.4, 52.6], home: 'emergency', inZone: 22, seen: 0.4, battery: 14, useEnded: 600, cleaned: 560, usage: 225, trail: [['nurses-station', 26], ['emergency', 700]] },
  { id: 'HB-03', type: 'hospital-bed', model: BED_ICU, status: 'available', zone: 'icu', at: [33.1, 56.2], home: 'icu', inZone: 10000, seen: 0.3, battery: 61, useEnded: 900, cleaned: 840, usage: 540 },

  // Ward A
  { id: 'HB-05', type: 'hospital-bed', model: BED, status: 'available', zone: 'ward-a', at: [42.9, 54.5], home: 'ward-a', inZone: 900, seen: 130, battery: 23, useEnded: 500, cleaned: 470, usage: 820 },
  { id: 'IP-109', type: 'infusion-pump', model: PUMP, status: 'in-use', zone: 'ward-a', at: [48.6, 52.8], home: 'ward-a', inZone: 780, seen: 0.3, battery: 35, useEnded: 800, cleaned: 790, usage: 760 },
  { id: 'WC-07', type: 'wheelchair', model: CHAIR, status: 'in-use', zone: 'ward-a', at: [48.6, 56.4], home: 'ward-a', inZone: 65, seen: 0.2, battery: 3, useEnded: 900, cleaned: 850, usage: 170 },
  { id: 'US-01', type: 'portable-ultrasound', model: ULTRASOUND, status: 'available', zone: 'ward-a', at: [54.4, 54.5], home: 'emergency', inZone: 230, seen: 0.5, battery: 76, useEnded: 190, cleaned: 160, usage: 150, trail: [['nurses-station', 235], ['emergency', 900]] },
  { id: 'IP-107', type: 'infusion-pump', model: PUMP, status: 'available', zone: 'ward-a', at: [60.1, 54.5], home: 'ward-a', inZone: 700, seen: 0.2, battery: 66, useEnded: 40, cleaned: 540, usage: 520 },
  { id: 'WC-09', type: 'wheelchair', model: CHAIR, status: 'available', zone: 'ward-a', at: [45, 44], home: 'ward-a', inZone: 140, seen: 0.6, battery: 79, useEnded: 130, cleaned: 100, usage: 85 },
  { id: 'DF-02', type: 'defibrillator', model: DEFIB, status: 'available', zone: 'ward-a', at: [56, 43], home: 'emergency', inZone: 6, seen: 0.2, battery: 68, useEnded: 4300, cleaned: 4250, usage: 0, trail: [['nurses-station', 9], ['emergency', 3000]] },

  // Ward B
  { id: 'HB-06', type: 'hospital-bed', model: BED, status: 'in-use', zone: 'ward-b', at: [65.9, 54.5], home: 'ward-b', inZone: 3800, seen: 0.4, battery: 19, useEnded: 3900, cleaned: 3850, usage: 1395 },
  { id: 'IP-112', type: 'infusion-pump', model: PUMP, status: 'in-use', zone: 'ward-b', at: [71.6, 54.5], home: 'ward-b', inZone: 380, seen: 34, battery: 29, useEnded: 420, cleaned: 400, usage: 905 },
  { id: 'PM-06', type: 'patient-monitor', model: MONITOR, status: 'available', zone: 'ward-b', at: [77.4, 54.5], home: 'ward-b', inZone: 1500, seen: 0.3, battery: 38, useEnded: 120, cleaned: 1440, usage: 640 },
  { id: 'VT-07', type: 'ventilator', model: VENT, status: 'available', zone: 'ward-b', at: [83.1, 54.5], home: 'icu', inZone: 1560, seen: 0.5, battery: 87, useEnded: 1500, cleaned: 1440, usage: 0, trail: [['nurses-station', 1565], ['icu', 5200]] },
  { id: 'WC-10', type: 'wheelchair', model: CHAIR_XL, status: 'available', zone: 'ward-b', at: [68, 44], home: 'ward-b', inZone: 640, seen: 0.2, battery: 98, useEnded: 600, cleaned: 420, usage: 30 },
  { id: 'DF-05', type: 'defibrillator', model: DEFIB, status: 'available', zone: 'ward-b', at: [79, 43.5], home: 'ward-b', inZone: 15000, seen: 0.4, battery: 89, useEnded: 300, cleaned: 240, usage: 18 },

  // Pharmacy
  { id: 'IP-110', type: 'infusion-pump', model: PUMP_DUAL, status: 'available', zone: 'pharmacy', at: [93, 42], home: 'central-supply', inZone: 110, seen: 0.3, battery: 100, useEnded: null, cleaned: null, usage: 0, trail: [['nurses-station', 114], ['central-supply', 1500]] },

  // Central Supply
  { id: 'IP-111', type: 'infusion-pump', model: PUMP, status: 'available', zone: 'central-supply', at: [103, 43], home: 'central-supply', inZone: 1400, seen: 0.2, battery: 6, useEnded: 1500, cleaned: 1380, usage: 0 },
  { id: 'IP-115', type: 'infusion-pump', model: PUMP_DUAL, status: 'maintenance', zone: 'central-supply', at: [107, 43], home: 'central-supply', inZone: 4300, seen: 0.5, battery: 52, useEnded: 4400, cleaned: 4350, usage: 0 },
  { id: 'VT-06', type: 'ventilator', model: VENT, status: 'maintenance', zone: 'central-supply', at: [111, 43], home: 'icu', inZone: 2880, seen: 0.3, battery: 33, useEnded: 3000, cleaned: 2950, usage: 0, trail: [['nurses-station', 2886], ['icu', 9000]] },
  { id: 'WC-06', type: 'wheelchair', model: CHAIR, status: 'available', zone: 'central-supply', at: [103, 48.5], home: 'central-supply', inZone: 700, seen: 0.4, battery: 62, useEnded: 720, cleaned: 690, usage: 25 },
  { id: 'WC-08', type: 'wheelchair', model: CHAIR, status: 'maintenance', zone: 'central-supply', at: [107, 48.5], home: 'central-supply', inZone: 3000, seen: 0.6, battery: 26, useEnded: 3100, cleaned: 3050, usage: 0 },
  { id: 'PM-07', type: 'patient-monitor', model: MONITOR_TRANSPORT, status: 'available', zone: 'central-supply', at: [103, 54], home: 'central-supply', inZone: 1950, seen: 0.2, battery: 100, useEnded: 2000, cleaned: 1900, usage: 0 },
  { id: 'PM-09', type: 'patient-monitor', model: MONITOR, status: 'maintenance', zone: 'central-supply', at: [107, 54], home: 'icu', inZone: 2000, seen: 380, battery: 8, useEnded: 2100, cleaned: 2050, usage: 0, trail: [['nurses-station', 2004], ['icu', 7000]] },
]
