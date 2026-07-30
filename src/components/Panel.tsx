import type { ReactNode } from 'react'

type Accent = 'indigo' | 'rose' | 'emerald' | 'slate'

const accentStyles: Record<Accent, string> = {
  indigo: 'text-ink',
  rose: 'text-neg',
  emerald: 'text-pos',
  slate: 'text-ink-soft',
}

interface PanelProps {
  title: string
  icon?: ReactNode
  accent?: Accent
  onAdd?: () => void
  addTitle?: string
  children: ReactNode
  className?: string
}

export function Panel({
  title,
  icon,
  accent = 'slate',
  onAdd,
  addTitle = 'Добавить',
  children,
  className = '',
}: PanelProps) {
  return (
    <section
      className={`panel flex flex-col overflow-hidden ${className}`}
    >
      <header className="panel-header flex items-center justify-between gap-2">
        <h2 className="panel-title flex items-center gap-2.5 text-ink">
          <span className={`panel-icon ${accentStyles[accent]}`}>{icon}</span>
          <span>{title}</span>
        </h2>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            title={addTitle}
            aria-label={addTitle}
            className="icon-button"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}
      </header>
      <div className="flex-1 px-4 pb-5 pt-2 sm:px-5 sm:pb-5">{children}</div>
    </section>
  )
}
