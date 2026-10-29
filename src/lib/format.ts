/** Formatting helpers. All output is en-US; time-dependent helpers take `now`. */

export const MINUTE = 60_000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

const LOCALE = 'en-US'

/** Milliseconds between two instants (b - a). */
export function msBetween(a: string | Date, b: string | Date): number {
  return new Date(b).getTime() - new Date(a).getTime()
}

/**
 * Compact duration: "<1m", "42m", "5h", "5h 12m", "3d", "3d 4h".
 * Negative values are formatted by absolute value.
 */
export function formatDuration(ms: number): string {
  const abs = Math.abs(ms)
  if (abs < MINUTE) return '<1m'
  if (abs < HOUR) return `${Math.floor(abs / MINUTE)}m`
  if (abs < DAY) {
    const hours = Math.floor(abs / HOUR)
    const minutes = Math.floor((abs % HOUR) / MINUTE)
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
  }
  const days = Math.floor(abs / DAY)
  const hours = Math.floor((abs % DAY) / HOUR)
  return hours === 0 ? `${days}d` : `${days}d ${hours}h`
}

/** Time elapsed since `iso`, e.g. "3h 12m". */
export function formatAge(iso: string, now: Date): string {
  return formatDuration(Math.max(0, msBetween(iso, now)))
}

/** "just now", "12m ago", "3h ago", "2d ago", or "in 35m" for future instants. */
export function formatRelativeTime(iso: string, now: Date): string {
  const diff = msBetween(iso, now)
  if (Math.abs(diff) < MINUTE) return 'just now'
  const unit = (ms: number) => {
    if (ms < HOUR) return `${Math.floor(ms / MINUTE)}m`
    if (ms < DAY) return `${Math.floor(ms / HOUR)}h`
    return `${Math.floor(ms / DAY)}d`
  }
  return diff > 0 ? `${unit(diff)} ago` : `in ${unit(-diff)}`
}

/** "Oct 29, 2:05 PM". Pass `timeZone` for deterministic output (tests use "UTC"). */
export function formatDateTime(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(new Date(iso))
}

/**
 * Calendar date. Date-only strings ("2026-10-20") are treated as calendar days,
 * so they never shift with the viewer's time zone.
 */
export function formatDate(value: string, options: { withYear?: boolean } = {}): string {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  return new Intl.DateTimeFormat(LOCALE, {
    month: 'short',
    day: 'numeric',
    year: options.withYear ? 'numeric' : undefined,
    timeZone: dateOnly ? 'UTC' : undefined,
  }).format(new Date(dateOnly ? `${value}T00:00:00Z` : value))
}

/** Long date for headings, e.g. "Thursday, October 29". */
export function formatLongDate(now: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone,
  }).format(now)
}

/** Short weekday date, e.g. "Thu, Oct 29". */
export function formatShortWeekday(now: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat(LOCALE, { weekday: 'short', month: 'short', day: 'numeric', timeZone }).format(now)
}

/** 24-hour clock with seconds, e.g. "14:05:09". */
export function formatClock(now: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(now)
}

/** Short time zone name for the clock, e.g. "GMT-3" or "EDT". */
export function formatTimeZoneName(now: Date, timeZone?: string): string {
  const part = new Intl.DateTimeFormat(LOCALE, { timeZoneName: 'short', timeZone })
    .formatToParts(now)
    .find((p) => p.type === 'timeZoneName')
  return part?.value ?? ''
}

/** Percentage from a 0-100 value, e.g. 94.44 -> "94.4%". */
export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

/** Minutes as a compact duration, e.g. 75 -> "1h 15m". */
export function formatMinutes(minutes: number): string {
  return formatDuration(Math.round(minutes) * MINUTE)
}

/** Time of day, e.g. "2:05 PM". Pass `timeZone` for deterministic output (tests use "UTC"). */
export function formatTime(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit', timeZone }).format(new Date(iso))
}

/** Time of day for instants in the last 20 hours ("8:37 AM"), date and time before that ("Oct 26, 12:22 PM"). */
export function formatWhen(iso: string, now: Date, timeZone?: string): string {
  return msBetween(iso, now) < 20 * HOUR ? formatTime(iso, timeZone) : formatDateTime(iso, timeZone)
}
