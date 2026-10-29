/** Plane geometry in floor-plan meters. */
import type { Point } from '../types'

const EPSILON = 1e-9

/** Straight-line distance between two points, in meters. */
export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

function onSegment(p: Point, a: Point, b: Point): boolean {
  const cross = (p.y - a.y) * (b.x - a.x) - (p.x - a.x) * (b.y - a.y)
  if (Math.abs(cross) > EPSILON) return false
  return (
    p.x >= Math.min(a.x, b.x) - EPSILON &&
    p.x <= Math.max(a.x, b.x) + EPSILON &&
    p.y >= Math.min(a.y, b.y) - EPSILON &&
    p.y <= Math.max(a.y, b.y) + EPSILON
  )
}

/**
 * Whether `p` is inside the polygon (ray casting). Points on an edge count as inside,
 * so a point on a wall shared by two zones belongs to both.
 */
export function pointInPolygon(p: Point, polygon: readonly Point[]): boolean {
  if (polygon.length < 3) return false
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!
    const b = polygon[j]!
    if (onSegment(p, a, b)) return true
    const crosses = a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
    if (crosses) inside = !inside
  }
  return inside
}

export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export function polygonBounds(polygon: readonly Point[]): Bounds {
  const xs = polygon.map((p) => p.x)
  const ys = polygon.map((p) => p.y)
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) }
}

/** Area centroid of a simple polygon (falls back to the vertex average for degenerate ones). */
export function polygonCentroid(polygon: readonly Point[]): Point {
  let area = 0
  let cx = 0
  let cy = 0
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j]!
    const b = polygon[i]!
    const f = a.x * b.y - b.x * a.y
    area += f
    cx += (a.x + b.x) * f
    cy += (a.y + b.y) * f
  }
  if (Math.abs(area) < EPSILON) {
    const n = polygon.length || 1
    return {
      x: polygon.reduce((s, p) => s + p.x, 0) / n,
      y: polygon.reduce((s, p) => s + p.y, 0) / n,
    }
  }
  area *= 0.5
  return { x: cx / (6 * area), y: cy / (6 * area) }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** A zoom: screen = point * scale + offset (in floor-plan units). */
export interface ViewTransform {
  scale: number
  x: number
  y: number
}

export const IDENTITY_VIEW: ViewTransform = { scale: 1, x: 0, y: 0 }

/**
 * Zoom that brings `point` toward the center of a `width` x `height` view at `scale`,
 * without ever showing anything outside the view's edges.
 */
export function focusTransform(point: Point, view: { width: number; height: number }, scale: number): ViewTransform {
  if (scale <= 1) return IDENTITY_VIEW
  const x = clamp(view.width / 2 - point.x * scale, view.width * (1 - scale), 0)
  const y = clamp(view.height / 2 - point.y * scale, view.height * (1 - scale), 0)
  return { scale, x, y }
}

/** Where `point` lands on screen after `view`. */
export function applyView(point: Point, view: ViewTransform): Point {
  return { x: point.x * view.scale + view.x, y: point.y * view.scale + view.y }
}
