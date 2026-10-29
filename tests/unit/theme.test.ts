import { describe, expect, it } from 'vitest'
import { THEME_STORAGE_KEY, parseStoredTheme, resolveTheme, toggleTheme } from '../../src/lib/theme'

describe('parseStoredTheme', () => {
  it('returns the theme for stored "light" and "dark"', () => {
    expect(parseStoredTheme('light')).toBe('light')
    expect(parseStoredTheme('dark')).toBe('dark')
  })

  it('returns null when nothing is stored', () => {
    expect(parseStoredTheme(null)).toBeNull()
  })

  it('returns null for the empty string', () => {
    expect(parseStoredTheme('')).toBeNull()
  })

  it('returns null for values that are not a theme ("blue", "Dark", " DARK ")', () => {
    expect(parseStoredTheme('blue')).toBeNull()
    expect(parseStoredTheme('Dark')).toBeNull()
    expect(parseStoredTheme(' DARK ')).toBeNull()
  })
})

describe('resolveTheme', () => {
  it('uses a stored "light" choice even when the system prefers dark', () => {
    expect(resolveTheme('light', true)).toBe('light')
  })

  it('uses a stored "light" choice when the system prefers light', () => {
    expect(resolveTheme('light', false)).toBe('light')
  })

  it('uses a stored "dark" choice even when the system prefers light', () => {
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('uses a stored "dark" choice when the system prefers dark', () => {
    expect(resolveTheme('dark', true)).toBe('dark')
  })

  it('follows the system setting when nothing is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme(null, false)).toBe('light')
  })

  it('follows the system setting when the stored value is invalid', () => {
    expect(resolveTheme('', true)).toBe('dark')
    expect(resolveTheme('', false)).toBe('light')
    expect(resolveTheme('blue', true)).toBe('dark')
    expect(resolveTheme('blue', false)).toBe('light')
    expect(resolveTheme('Dark', true)).toBe('dark')
    expect(resolveTheme('Dark', false)).toBe('light')
  })
})

describe('toggleTheme', () => {
  it('toggles from "light" to "dark"', () => {
    expect(toggleTheme('light')).toBe('dark')
  })

  it('toggles from "dark" to "light"', () => {
    expect(toggleTheme('dark')).toBe('light')
  })
})

describe('THEME_STORAGE_KEY', () => {
  it('is the storage key the toggle writes to', () => {
    expect(THEME_STORAGE_KEY).toBe('trackwell-theme')
  })
})
