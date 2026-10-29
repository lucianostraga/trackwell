import { describe, expect, it } from 'vitest'
import {
  DAY,
  HOUR,
  MINUTE,
  formatAge,
  formatClock,
  formatDate,
  formatDateTime,
  formatDuration,
  formatLongDate,
  formatMinutes,
  formatPercent,
  formatRelativeTime,
  formatShortWeekday,
  formatTime,
  formatWhen,
  formatTimeZoneName,
  msBetween,
} from '../../src/lib/format'
import { NOW, minutesAgo } from './fixtures'

describe('formatDuration', () => {
  it.each([
    [0, '<1m'],
    [59 * 1000, '<1m'],
    [MINUTE, '1m'],
    [42 * MINUTE, '42m'],
    [HOUR, '1h'],
    [HOUR + 12 * MINUTE, '1h 12m'],
    [23 * HOUR + 59 * MINUTE, '23h 59m'],
    [DAY, '1d'],
    [3 * DAY + 4 * HOUR + 30 * MINUTE, '3d 4h'],
  ])('%i ms -> %s', (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected)
  })

  it('formats negative durations by absolute value', () => {
    expect(formatDuration(-90 * MINUTE)).toBe('1h 30m')
  })
})

describe('formatAge', () => {
  it('is the time elapsed since the timestamp', () => {
    expect(formatAge(minutesAgo(205), NOW)).toBe('3h 25m')
  })

  it('never goes negative for future timestamps', () => {
    expect(formatAge(minutesAgo(-10), NOW)).toBe('<1m')
  })
})

describe('formatRelativeTime', () => {
  it.each([
    [0, 'just now'],
    [12, '12m ago'],
    [3 * 60 + 40, '3h ago'],
    [2 * 24 * 60 + 5, '2d ago'],
    [-35, 'in 35m'],
    [-5 * 60, 'in 5h'],
  ])('%i minutes ago -> %s', (minutes, expected) => {
    expect(formatRelativeTime(minutesAgo(minutes), NOW)).toBe(expected)
  })
})

describe('calendar formatting', () => {
  it('formats date and time in a given time zone', () => {
    expect(formatDateTime('2026-10-29T14:05:00Z', 'UTC')).toBe('Oct 29, 2:05 PM')
  })

  it('treats date-only strings as calendar days', () => {
    expect(formatDate('2026-10-20')).toBe('Oct 20')
    expect(formatDate('2019-03-11', { withYear: true })).toBe('Mar 11, 2019')
  })

  it('formats the long heading date and the clock', () => {
    expect(formatLongDate(NOW, 'UTC')).toBe('Thursday, October 29')
    expect(formatShortWeekday(NOW, 'UTC')).toBe('Thu, Oct 29')
    expect(formatClock(new Date('2026-10-29T09:05:07Z'), 'UTC')).toBe('09:05:07')
    expect(formatTimeZoneName(NOW, 'UTC')).toBe('UTC')
    expect(formatTime('2026-10-29T14:05:00Z', 'UTC')).toBe('2:05 PM')
  })
})

describe('numbers', () => {
  it('formats percentages with one decimal by default', () => {
    expect(formatPercent(94.4444)).toBe('94.4%')
    expect(formatPercent(100, 0)).toBe('100%')
  })

  it('formats minutes as a duration', () => {
    expect(formatMinutes(18.8)).toBe('19m')
    expect(formatMinutes(75)).toBe('1h 15m')
  })

  it('measures milliseconds between instants', () => {
    expect(msBetween(minutesAgo(10), NOW)).toBe(10 * MINUTE)
  })
})


describe('formatWhen', () => {
  it('shows only the time for recent instants and adds the date for older ones', () => {
    expect(formatWhen(minutesAgo(19 * 60), NOW, 'UTC')).toBe('8:00 PM')
    expect(formatWhen(minutesAgo(26 * 60), NOW, 'UTC')).toBe('Oct 28, 1:00 PM')
  })
})
