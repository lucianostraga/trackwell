import { describe, expect, it } from 'vitest'
import { formatBuildTime, formatDate, formatDateTime } from '../../src/lib/format'

describe('formatDate', () => {
  it('treats date-only strings as calendar days', () => {
    expect(formatDate('2026-10-20')).toBe('Oct 20')
    expect(formatDate('2026-10-06', { withYear: true })).toBe('Oct 6, 2026')
  })

  it('never shifts a date-only string with the time zone', () => {
    expect(formatDate('2026-01-01', { withYear: true })).toBe('Jan 1, 2026')
  })
})

describe('formatDateTime', () => {
  it('formats date and time in a given time zone', () => {
    expect(formatDateTime('2026-10-29T14:05:00Z', 'UTC')).toBe('Oct 29, 2:05 PM')
  })
})

describe('formatBuildTime', () => {
  it('formats ISO timestamps and keeps anything else as is', () => {
    expect(formatBuildTime('2026-10-29T14:05:00Z', 'UTC')).toBe('Oct 29, 2:05 PM')
    expect(formatBuildTime('local')).toBe('local')
  })
})
