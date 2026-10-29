import { Moon, Sun } from 'lucide-react'
import { cn } from './ui/cn'
import { useTheme } from './useTheme'

/** Navbar button that switches between the light and dark theme. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={dark}
      data-testid="theme-toggle"
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-lg text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900 [&>svg]:size-[18px]',
        className,
      )}
    >
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  )
}
