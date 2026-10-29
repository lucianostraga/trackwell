import { describe, expect, it } from 'vitest'
import { formatBuildTime, formatDate, formatDateTime, formatInteger, formatUsd } from '../../src/lib/format'

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

describe('formatUsd', () => {
  it('formats whole dollars with grouping and no cents', () => {
    expect(formatUsd(78000)).toBe('$78,000')
    expect(formatUsd(12000000)).toBe('$12,000,000')
    expect(formatUsd(0)).toBe('$0')
  })
})

describe('formatInteger', () => {
  it('groups thousands', () => {
    expect(formatInteger(1500)).toBe('1,500')
    expect(formatInteger(125)).toBe('125')
    expect(formatInteger(5000)).toBe('5,000')
  })
})
