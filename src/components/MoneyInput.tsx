import { useState } from 'react'

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
  const [draft, setDraft] = useState<string>(value ? String(value) : '')
  const [lastValue, setLastValue] = useState<number>(value)

  // Синхронизация во время рендера при внешних изменениях (импорт, сброс).
  // Не затираем то, что пользователь печатает прямо сейчас.
  if (value !== lastValue) {
    setLastValue(value)
    const draftNum = draft === '' ? 0 : Number(draft)
    if (draftNum !== value) {
      setDraft(value ? String(value) : '')
    }
  }

  return (
    <input
      type="number"
      inputMode="decimal"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => {
        const next = e.target.value
        setDraft(next)
        onChange(next === '' ? 0 : Number(next))
      }}
      className={`field w-full px-2.5 py-1.5 text-sm tabular-nums ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    />
  )
}
