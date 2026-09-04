import { useLayoutEffect, useRef, useState } from 'react'
import { formatMoneyInput, parseMoneyInput } from '../lib/format'
import { Input } from './ui/input'

interface MoneyInputProps {
  value: number
  onChange: (value: number) => void
  align?: 'left' | 'right'
  placeholder?: string
}

export function MoneyInput({
  value,
  onChange,
  align = 'right',
  placeholder = '0',
}: MoneyInputProps) {
  const [draft, setDraft] = useState(() => (value ? formatMoneyInput(String(value)) : ''))
  const [lastValue, setLastValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingCaret = useRef<number | null>(null)

  // Синхронизация во время рендера при внешних изменениях (импорт, сброс).
  // Не затираем то, что пользователь печатает прямо сейчас.
  if (value !== lastValue) {
    setLastValue(value)
    if (parseMoneyInput(draft) !== value) {
      setDraft(value ? formatMoneyInput(String(value)) : '')
    }
  }

  useLayoutEffect(() => {
    if (pendingCaret.current === null || document.activeElement !== inputRef.current) return
    inputRef.current?.setSelectionRange(pendingCaret.current, pendingCaret.current)
    pendingCaret.current = null
  }, [draft])

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => {
        const next = e.target.value
        const caret = e.target.selectionStart ?? next.length
        const hasDecimal = /[.,]/.test(next.slice(0, caret))
        const digitsBeforeCaret = next.slice(0, caret).replace(/\D/g, '').length
        const formatted = formatMoneyInput(next)
        let nextCaret: number
        if (hasDecimal) {
          const decimalIndex = formatted.indexOf(',')
          nextCaret = decimalIndex < 0 ? formatted.length : decimalIndex + 1
          nextCaret += next.slice(0, caret).split(/[.,]/)[1]?.replace(/\D/g, '').length ?? 0
        } else {
          let digits = 0
          nextCaret = 0
          while (nextCaret < formatted.length && digits < digitsBeforeCaret) {
            if (/\d/.test(formatted[nextCaret])) digits += 1
            nextCaret += 1
          }
        }

        pendingCaret.current = nextCaret
        setDraft(formatted)
        onChange(parseMoneyInput(next))
      }}
      className={`min-w-0 px-2.5 py-1.5 tabular-nums ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    />
  )
}
