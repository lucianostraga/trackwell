import type { Point, Zone, ZoneId } from '../types'

/** The customer instance shown in the demo (fictional). */
export const FACILITY = {
  name: 'St. Aurelia Medical Center',
  floors: [
    { id: 'level-1', name: 'Level 1 · Outpatient & Imaging', tracked: false },
    { id: 'level-2', name: 'Level 2 · Critical Care', tracked: true },
    { id: 'level-3', name: 'Level 3 · Maternity & Pediatrics', tracked: false },
  ],
  currentFloorId: 'level-2',
} as const

export const CURRENT_USER = { name: 'Jordan Lee', team: 'Clinical Engineering', initials: 'JL' } as const

/** Floor plan size in meters (the SVG viewBox). The building sits inside with a margin. */
export const FLOOR = {
  width: 120,
  height: 64,
  building: { x: 3, y: 3, width: 114, height: 56 },
} as const

const rect = (x0: number, y0: number, x1: number, y1: number): Point[] => [
  { x: x0, y: y0 },
  { x: x1, y: y0 },
  { x: x1, y: y1 },
  { x: x0, y: y1 },
]

/**
 * Level 2 · Critical Care. Departments north and south of the main corridor; the
 * corridor and the central nurses' station form one zone.
 */
export const ZONES: readonly Zone[] = [
  { id: 'emergency', name: 'Emergency', polygon: rect(3, 3, 35, 27) },
  { id: 'radiology', name: 'Radiology', polygon: rect(35, 3, 56, 27) },
  { id: 'operating-rooms', name: 'Operating Rooms', polygon: rect(56, 3, 90, 27) },
  { id: 'sterile-processing', name: 'Sterile Processing', polygon: rect(90, 3, 117, 27) },
  { id: 'nurses-station', name: "Nurses' Station & Corridor", polygon: rect(3, 27, 117, 34) },
  { id: 'icu', name: 'ICU', polygon: rect(3, 34, 40, 59) },
  { id: 'ward-a', name: 'Ward A', polygon: rect(40, 34, 63, 59) },
  { id: 'ward-b', name: 'Ward B', polygon: rect(63, 34, 86, 59) },
  { id: 'pharmacy', name: 'Pharmacy', polygon: rect(86, 34, 100, 59) },
  { id: 'central-supply', name: 'Central Supply', polygon: rect(100, 34, 117, 59) },
]

export const ZONE_IDS: readonly ZoneId[] = ZONES.map((z) => z.id)

/** Door openings in the walls (drawing only): center point, width and the wall's direction. */
export const DOORS: ReadonlyArray<{ at: Point; width: number; wall: 'horizontal' | 'vertical' }> = [
  // North side of the corridor
  { at: { x: 12, y: 27 }, width: 3.2, wall: 'horizontal' },
  { at: { x: 28, y: 27 }, width: 3.2, wall: 'horizontal' },
  { at: { x: 45.5, y: 27 }, width: 2.6, wall: 'horizontal' },
  { at: { x: 64, y: 27 }, width: 3.2, wall: 'horizontal' },
  { at: { x: 82, y: 27 }, width: 3.2, wall: 'horizontal' },
  { at: { x: 97, y: 27 }, width: 2.6, wall: 'horizontal' },
  // South side of the corridor
  { at: { x: 14, y: 34 }, width: 3.2, wall: 'horizontal' },
  { at: { x: 31, y: 34 }, width: 3.2, wall: 'horizontal' },
  { at: { x: 51.5, y: 34 }, width: 2.6, wall: 'horizontal' },
  { at: { x: 74.5, y: 34 }, width: 2.6, wall: 'horizontal' },
  { at: { x: 93, y: 34 }, width: 2.2, wall: 'horizontal' },
  { at: { x: 108.5, y: 34 }, width: 2.6, wall: 'horizontal' },
  // Ambulance entrance (west wall of Emergency)
  { at: { x: 3, y: 17 }, width: 5, wall: 'vertical' },
]
