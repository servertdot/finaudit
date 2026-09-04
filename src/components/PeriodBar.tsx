import { Input } from './ui/input'
import { Select } from './ui/select'
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
    <div className="period-surface material-bar flex flex-wrap items-center gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-[0.65rem] bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-accent">
        <CalendarIcon size={18} />
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => hasPrev && onSelect(sorted[index - 1].month)}
          disabled={!hasPrev}
          aria-label="Предыдущий месяц"
          className="icon-button text-ink-soft disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeftIcon size={16} />
        </button>

        <div className="relative">
          <Select
            value={activeMonth}
            onChange={(e) => onSelect(e.target.value)}
            aria-label="Текущий месяц"
            className="appearance-none px-4 py-1.5 text-center text-[14px] font-semibold"
          >
            {sorted.map((m) => (
              <option key={m.month} value={m.month}>
                {formatMonth(m.month)}
              </option>
            ))}
          </Select>
        </div>

        <button
          type="button"
          onClick={() => hasNext && onSelect(sorted[index + 1].month)}
          disabled={!hasNext}
          aria-label="Следующий месяц"
          className="icon-button text-ink-soft disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRightIcon size={16} />
        </button>
      </div>

      <Input
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Заметка к месяцу (премия, отпуск…)"
        aria-label="Заметка к месяцу"
        className="min-w-[12rem] flex-1 border-transparent bg-transparent px-2.5 py-1.5 text-[13px] text-ink-soft hover:bg-ink/4 focus:border-line focus:bg-surface"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAddMonth}
          className="flex min-h-8 items-center gap-1.5 rounded-[0.65rem] bg-accent px-3 py-1.5 text-[13px] font-semibold text-white transition-[filter,transform] hover:brightness-95"
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
          className="icon-button text-neg hover:bg-neg-soft disabled:cursor-not-allowed disabled:opacity-30"
        >
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  )
}
