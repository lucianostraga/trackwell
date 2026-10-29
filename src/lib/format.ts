/** Formatting helpers. All output is en-US. */

const LOCALE = 'en-US'

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

/** Build time for the footer: a formatted date for ISO timestamps, the raw value otherwise ("local"). */
export function formatBuildTime(value: string, timeZone?: string): string {
  return Number.isNaN(Date.parse(value)) ? value : formatDateTime(value, timeZone)
}

/** "$78,000": whole US dollars, en-US grouping, no cents. */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** "1,500": whole number with en-US grouping. */
export function formatInteger(value: number): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(value)
}
