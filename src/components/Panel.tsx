import { useEffect, useState, type ReactNode } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { cn } from '../lib/utils'
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
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!expanded) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [expanded])

  return (
    <>
      {expanded && (
        <button
          type="button"
          aria-label="Закрыть полноэкранный режим"
          className="panel-backdrop"
          onClick={() => setExpanded(false)}
        />
      )}
      <Card
        className={cn(
          'panel flex flex-col overflow-hidden',
          expanded && 'panel-expanded',
          className,
        )}
      >
        <CardHeader className="panel-header">
          <CardTitle className="panel-title flex items-center gap-2.5">
            <span className={`panel-icon ${accentStyles[accent]}`}>{icon}</span>
            <span>{title}</span>
          </CardTitle>
          <div className="flex items-center gap-1">
            {onAdd && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
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
              </Button>
            )}
            {expanded && <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setExpanded((value) => !value)}
              title={expanded ? 'Свернуть' : 'Открыть на весь экран'}
              aria-label={expanded ? 'Свернуть' : 'Открыть на весь экран'}
              aria-expanded={expanded}
              className="icon-button"
            >
              {expanded ? <Minimize2 /> : <Maximize2 />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="panel-content">{children}</CardContent>
      </Card>
    </>
  )
}
