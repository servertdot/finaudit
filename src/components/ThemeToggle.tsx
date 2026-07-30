import type { Theme } from '../lib/theme'
import { MoonIcon, SunIcon } from './icons'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
  className?: string
}

export function ThemeToggle({ theme, onToggle, className = '' }: ThemeToggleProps) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      title={isDark ? 'Светлая тема' : 'Тёмная тема'}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      className={`toolbar-button toolbar-button-default flex shrink-0 items-center gap-2 ${className}`}
    >
      {isDark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
      <span>{isDark ? 'Светлая' : 'Тёмная'}</span>
    </button>
  )
}
