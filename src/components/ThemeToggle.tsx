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
      className={`flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-[13px] font-medium tracking-tight text-ink-soft transition-colors hover:border-ink hover:text-ink ${className}`}
    >
      {isDark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
      <span>{isDark ? 'Светлая' : 'Тёмная'}</span>
    </button>
  )
}
