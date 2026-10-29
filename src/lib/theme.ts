export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'trackwell-theme'

/** 'light' | 'dark' from storage; anything else (null, '', 'blue', ' DARK ') → null. */
export function parseStoredTheme(value: string | null): Theme | null {
  return value === 'light' || value === 'dark' ? value : null
}

/** A valid stored choice wins; otherwise the system setting (true → 'dark', false → 'light'). */
export function resolveTheme(stored: string | null, systemPrefersDark: boolean): Theme {
  return parseStoredTheme(stored) ?? (systemPrefersDark ? 'dark' : 'light')
}

export function toggleTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark'
}
