import { memo } from 'react'
import { DOORS, FLOOR, ZONES } from '../../data/floor'
import { polygonBounds } from '../../lib/geometry'
import type { ZoneId } from '../../types'

/**
 * The static drawing of Level 2 in floor-plan meters (1 SVG unit = 1 m): zone fills,
 * room details, walls, doors and labels. Assets are drawn on top by FloorPlan.
 */

const LINE = 'var(--color-map-line)'
const WALL = 'var(--color-map-wall)'
const THIN = 0.14

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

function Curtains({ x0, x1, y0, y1, bays, edge }: { x0: number; x1: number; y0: number; y1: number; bays: number; edge: number }) {
  const w = (x1 - x0) / bays
  return (
    <g stroke={LINE} strokeWidth={THIN} strokeDasharray="0.55 0.35" fill="none">
      {range(bays - 1).map((i) => (
        <line key={i} x1={x0 + w * (i + 1)} x2={x0 + w * (i + 1)} y1={y0} y2={y1} />
      ))}
      <line x1={x0} x2={x1} y1={edge} y2={edge} />
    </g>
  )
}

/** Patient rooms along the south wall, each with a door gap toward the ward. */
function PatientRooms({ x0, x1, top, bottom, rooms }: { x0: number; x1: number; top: number; bottom: number; rooms: number }) {
  const w = (x1 - x0) / rooms
  return (
    <g stroke={WALL} strokeWidth={0.2} strokeLinecap="round" fill="none" opacity={0.75}>
      {range(rooms - 1).map((i) => (
        <line key={`v${i}`} x1={x0 + w * (i + 1)} x2={x0 + w * (i + 1)} y1={top} y2={bottom} />
      ))}
      {range(rooms).map((i) => {
        const a = x0 + w * i
        return (
          <g key={`h${i}`}>
            <line x1={a} x2={a + 0.9} y1={top} y2={top} />
            <line x1={a + 2.7} x2={a + w} y1={top} y2={top} />
            <path
              d={`M${a + 0.9} ${top} V${top + 1.8} A1.8 1.8 0 0 0 ${a + 2.7} ${top}`}
              strokeWidth={THIN}
              stroke={LINE}
            />
          </g>
        )
      })}
    </g>
  )
}

function Decor() {
  return (
    <g>
      {/* Emergency: treatment bays and triage desk */}
      <Curtains x0={18} x1={35} y0={3} y1={10.2} bays={4} edge={10.2} />
      <rect x={4.6} y={10} width={4.4} height={1.4} rx={0.5} fill="#fff" stroke={LINE} strokeWidth={THIN} />

      {/* Radiology: CT room with its scanner */}
      <path d="M47 3 V14.5 H50.3 M52.7 14.5 H56" fill="none" stroke={WALL} strokeWidth={0.22} />
      <circle cx={51.5} cy={7.4} r={2.1} fill="#fff" stroke={LINE} strokeWidth={0.75} />
      <rect x={50.9} y={7.4} width={1.2} height={4.4} rx={0.4} fill="#fff" stroke={LINE} strokeWidth={THIN} />

      {/* Operating Rooms: three theatres with tables and lights */}
      <g fill="none" stroke={WALL} strokeWidth={0.22}>
        <line x1={56} x2={90} y1={9} y2={9} />
        <line x1={67.33} x2={67.33} y1={9} y2={21} />
        <line x1={78.67} x2={78.67} y1={9} y2={21} />
        {[56, 67.33, 78.67].map((x) => (
          <g key={x}>
            <line x1={x} x2={x + 4.2} y1={21} y2={21} />
            <line x1={x + 7.1} x2={x + 11.33} y1={21} y2={21} />
          </g>
        ))}
      </g>
      {[61.67, 73, 84.33].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={15} r={2.3} fill="none" stroke={LINE} strokeWidth={THIN} strokeDasharray="0.5 0.35" />
          <rect x={cx - 0.7} y={13.1} width={1.4} height={3.8} rx={0.35} fill="#fff" stroke={LINE} strokeWidth={THIN} />
        </g>
      ))}

      {/* Sterile Processing: decontamination | clean, washer-disinfectors */}
      <line x1={101.5} x2={101.5} y1={9} y2={24.5} stroke={LINE} strokeWidth={THIN} strokeDasharray="0.55 0.35" />
      {[9.5, 13.5, 17.5].map((y) => (
        <rect key={y} x={110.6} y={y} width={5} height={3} rx={0.4} fill="#fff" stroke={LINE} strokeWidth={THIN} />
      ))}

      {/* Corridor: stairs (west) and elevators (east) */}
      <g stroke={LINE} strokeWidth={THIN}>
        <rect x={3.6} y={28} width={4.6} height={5} rx={0.3} fill="#fff" />
        {range(7).map((i) => (
          <line key={i} x1={4.2 + i * 0.6} x2={4.2 + i * 0.6} y1={28} y2={33} />
        ))}
        {[110.4, 113.4].map((x) => (
          <g key={x}>
            <rect x={x} y={29.2} width={2.7} height={2.7} rx={0.25} fill="#fff" />
            <path d={`M${x} 29.2 l2.7 2.7 M${x + 2.7} 29.2 l-2.7 2.7`} fill="none" />
          </g>
        ))}
      </g>

      {/* ICU: eight bays along the south wall and the central monitoring desk */}
      <Curtains x0={3} x1={40} y0={50} y1={59} bays={8} edge={50} />
      <rect x={14} y={42.4} width={14} height={2.6} rx={1.3} fill="#fff" stroke={LINE} strokeWidth={THIN} />

      {/* Wards: patient rooms */}
      <PatientRooms x0={40} x1={63} top={49} bottom={59} rooms={4} />
      <PatientRooms x0={63} x1={86} top={49} bottom={59} rooms={4} />

      {/* Pharmacy shelving and Central Supply racks */}
      {[47, 50.5, 54].map((y) => (
        <rect key={y} x={88.2} y={y} width={9.6} height={0.9} rx={0.3} fill={LINE} opacity={0.7} />
      ))}
      <rect x={113.8} y={40} width={2.2} height={17} rx={0.3} fill={LINE} opacity={0.7} />

      {/* Room names */}
      <g fontSize={0.72} fontWeight={600} letterSpacing={0.08} fill="var(--color-ink-400)">
        <text x={6.8} y={11.02} textAnchor="middle" fontSize={0.6}>TRIAGE</text>
        <text x={19} y={4.5}>BAYS</text>
        <text x={4.3} y={21.3}>AMBULANCE</text>
        <text x={4.3} y={22.3}>ENTRANCE</text>
        <text x={47.9} y={4.6}>CT</text>
        <text x={56.9} y={10.4}>OR 1</text>
        <text x={68.2} y={10.4}>OR 2</text>
        <text x={79.5} y={10.4}>OR 3</text>
        <text x={102.4} y={10.4}>CLEAN SIDE</text>
        <text x={91.4} y={10.4}>DECONTAMINATION</text>
        <text x={21} y={44.15} textAnchor="middle" fontSize={0.62}>CENTRAL MONITORING</text>
        <text x={111.85} y={33.4} textAnchor="middle" fontSize={0.6}>ELEVATORS</text>
        <text x={5.9} y={33.4} textAnchor="middle" fontSize={0.6} fill="var(--color-ink-400)">STAIRS</text>
        <text x={4} y={50.9}>BEDS 1–8</text>
        <text x={40.8} y={50.1}>ROOMS 201–204</text>
        <text x={63.8} y={50.1}>ROOMS 205–208</text>
      </g>
    </g>
  )
}

interface FloorPlanArtProps {
  /** Assets per zone to print under each zone name. */
  zoneCounts: Record<ZoneId, number>
  /** True while a filter is active (counts then refer to the matching assets). */
  filtered: boolean
}

export const FloorPlanArt = memo(function FloorPlanArt({ zoneCounts, filtered }: FloorPlanArtProps) {
  const b = FLOOR.building
  return (
    <g>
      <defs>
        <filter id="building-shadow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="0.8" floodColor="#0e1a2b" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Building slab */}
      <rect x={b.x} y={b.y} width={b.width} height={b.height} rx={1.2} fill="var(--color-map-floor)" filter="url(#building-shadow)" />

      {/* Zone fills */}
      {ZONES.map((zone) => {
        const r = polygonBounds(zone.polygon)
        return (
          <rect
            key={zone.id}
            data-testid="map-zone"
            data-zone={zone.id}
            x={r.minX}
            y={r.minY}
            width={r.maxX - r.minX}
            height={r.maxY - r.minY}
            fill={`var(--color-zone-${zone.id})`}
          />
        )
      })}

      <Decor />

      {/* Walls between zones */}
      <g fill="none" stroke={WALL} strokeWidth={0.3}>
        {ZONES.map((zone) => {
          const r = polygonBounds(zone.polygon)
          return <rect key={zone.id} x={r.minX} y={r.minY} width={r.maxX - r.minX} height={r.maxY - r.minY} />
        })}
      </g>

      {/* Door openings */}
      {DOORS.map((door, i) => {
        const half = door.width / 2
        const horizontal = door.wall === 'horizontal'
        return (
          <line
            key={i}
            x1={horizontal ? door.at.x - half : door.at.x}
            x2={horizontal ? door.at.x + half : door.at.x}
            y1={horizontal ? door.at.y : door.at.y - half}
            y2={horizontal ? door.at.y : door.at.y + half}
            stroke={horizontal ? 'var(--color-map-corridor)' : 'var(--color-zone-emergency)'}
            strokeWidth={0.75}
          />
        )
      })}

      {/* Exterior wall */}
      <rect x={b.x} y={b.y} width={b.width} height={b.height} rx={1.2} fill="none" stroke="var(--color-map-wall-outer)" strokeWidth={0.5} />
      <line x1={3} x2={3} y1={14.5} y2={19.5} stroke="var(--color-zone-emergency)" strokeWidth={0.8} />

      {/* Nurses' station desk */}
      <rect x={55} y={29.4} width={10} height={2.2} rx={1.1} fill="#fff" stroke="var(--color-brand-300)" strokeWidth={0.2} />
      <text x={60} y={30.88} textAnchor="middle" fontSize={0.92} fontWeight={650} letterSpacing={0.09} fill="var(--color-brand-700)">
        NURSES&apos; STATION
      </text>

      {/* Zone names and counts */}
      {ZONES.filter((z) => z.id !== 'nurses-station').map((zone) => {
        const r = polygonBounds(zone.polygon)
        const n = zoneCounts[zone.id] ?? 0
        return (
          <g key={zone.id} data-testid="zone-label" data-zone={zone.id} opacity={filtered && n === 0 ? 0.45 : 1}>
            <text x={r.minX + 1.6} y={r.minY + 3.1} fontSize={1.55} fontWeight={650} letterSpacing={-0.02} fill="var(--color-map-label)">
              {zone.name}
            </text>
            <text x={r.minX + 1.6} y={r.minY + 5} fontSize={1.12} fontWeight={500} fill="var(--color-map-sublabel)" data-testid="zone-count">
              {n} {filtered ? 'matching' : n === 1 ? 'asset' : 'assets'}
            </text>
          </g>
        )
      })}
    </g>
  )
})
