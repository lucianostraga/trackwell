import { useCallback, useEffect, useState } from 'react'
import { THEME_STORAGE_KEY, parseStoredTheme, resolveTheme, toggleTheme, type Theme } from '../lib/theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function readStored(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

function systemPrefersDark(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches
}

function apply(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

/** Applies the starting theme to the page. Called before the first render so the wrong theme never flashes. */
export function initTheme(): Theme {
  const theme = resolveTheme(readStored(), systemPrefersDark())
  apply(theme)
  return theme
}

let transitionTimer: number | undefined

/** Turns on the color transition for a moment (never on first load). */
function animateColors(): void {
  const root = document.documentElement
  root.classList.add('theme-transition')
  window.clearTimeout(transitionTimer)
  transitionTimer = window.setTimeout(() => root.classList.remove('theme-transition'), 300)
}

/** Side effects of the theme: the page attribute, the saved choice and the live system setting. */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : document.documentElement.dataset.theme === 'light' ? 'light' : initTheme(),
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(DARK_QUERY)
    const onChange = () => {
      // Once a choice is stored, the system setting is ignored.
      const stored = readStored()
      if (parseStoredTheme(stored)) return
      const next = resolveTheme(stored, query.matches)
      animateColors()
      apply(next)
      setTheme(next)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    const next = toggleTheme(theme)
    animateColors()
    apply(next)
    setTheme(next)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* private mode: the choice just is not remembered */
    }
  }, [theme])

  return { theme, toggle }
}
