import type { MonthlySnapshot } from '../types'
import { compareMonthAsc, formatMonth } from '../lib/period'
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from './icons'

interface PeriodBarProps {
  months: MonthlySnapshot[]
  activeMonth: string
  note: string
  onSelect: (month: string) => void
  onAddMonth: () => void
  onRemoveMonth: (month: string) => void
  onNoteChange: (note: string) => void
}

export function PeriodBar({
  months,
  activeMonth,
  note,
  onSelect,
  onAddMonth,
  onRemoveMonth,
  onNoteChange,
}: PeriodBarProps) {
  const sorted = [...months].sort((a, b) => compareMonthAsc(a.month, b.month))
  const index = sorted.findIndex((m) => m.month === activeMonth)
  const hasPrev = index > 0
  const hasNext = index >= 0 && index < sorted.length - 1
  const canDelete = sorted.length > 1

  const handleDelete = () => {
    if (window.confirm(`Удалить месяц «${formatMonth(activeMonth)}»?`)) {
      onRemoveMonth(activeMonth)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <span className="text-pos">
        <CalendarIcon size={18} />
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => hasPrev && onSelect(sorted[index - 1].month)}
          disabled={!hasPrev}
          aria-label="Предыдущий месяц"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line-strong text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeftIcon size={16} />
        </button>

        <div className="relative">
          <select
            value={activeMonth}
            onChange={(e) => onSelect(e.target.value)}
            className="appearance-none rounded-full border border-line-strong bg-paper px-4 py-1.5 text-center text-[14px] font-medium text-ink outline-none transition-colors hover:border-ink focus:border-ink"
          >
            {sorted.map((m) => (
              <option key={m.month} value={m.month}>
                {formatMonth(m.month)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => hasNext && onSelect(sorted[index + 1].month)}
          disabled={!hasNext}
          aria-label="Следующий месяц"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line-strong text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRightIcon size={16} />
        </button>
      </div>

      <input
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Заметка к месяцу (премия, отпуск…)"
        className="min-w-0 flex-1 border-b border-transparent bg-transparent pb-1 text-[13px] text-ink-soft outline-none transition-colors placeholder:text-muted hover:border-line-strong focus:border-ink"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAddMonth}
          className="flex items-center gap-1.5 rounded-full border border-accent bg-accent px-3 py-1.5 text-[13px] font-medium text-paper transition-opacity hover:opacity-90"
        >
          <PlusIcon size={14} />
          Новый месяц
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={!canDelete}
          aria-label="Удалить месяц"
          title="Удалить месяц"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line-strong text-neg transition-colors hover:border-neg hover:bg-neg-soft disabled:cursor-not-allowed disabled:opacity-30"
        >
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  )
}
