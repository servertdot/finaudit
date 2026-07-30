import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { InfoIcon } from './icons'

interface InfoHintProps {
  title: string
  children: ReactNode
  /** Сторона раскрытия поповера (по умолчанию вправо-вниз). */
  align?: 'left' | 'right'
}

export function InfoHint({ title, children, align = 'right' }: InfoHintProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const popoverId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Что такое «${title}»`}
        aria-expanded={open}
        aria-controls={popoverId}
        className={`flex h-5 w-5 items-center justify-center rounded-full text-muted transition-colors hover:text-ink ${
          open ? 'text-ink' : ''
        }`}
      >
        <InfoIcon size={15} />
      </button>

      {open && (
        <div
          id={popoverId}
          role="tooltip"
          className={`popover absolute top-7 z-20 w-64 p-3.5 text-left ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <p className="mb-1.5 text-[13px] font-semibold text-ink">
            {title}
          </p>
          <div className="flex flex-col gap-2 text-[12px] leading-relaxed text-ink-soft">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
