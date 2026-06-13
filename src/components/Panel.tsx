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
      className={`flex flex-col overflow-hidden rounded-xl border border-line bg-surface ${className}`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
        <h2 className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink">
          <span className={accentStyles[accent]}>{icon}</span>
          <span>{title}</span>
        </h2>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            title={addTitle}
            aria-label={addTitle}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-line-strong text-ink-soft transition-colors hover:border-ink hover:text-ink"
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
      <div className="flex-1 px-5 py-5">{children}</div>
    </section>
  )
}
