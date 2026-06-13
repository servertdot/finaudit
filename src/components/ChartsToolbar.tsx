import { useEffect, useRef, useState } from 'react'
import {
  CHART_COLUMNS,
  CHART_LABELS,
  CHART_TYPES,
  CHART_TYPE_LABELS,
  type ChartColumns,
  type ChartConfig,
  type ChartKey,
  type ChartType,
} from '../lib/chartsConfig'

interface ChartsToolbarProps {
  charts: ChartConfig[]
  showPercent: boolean
  columns: ChartColumns
  onToggleVisible: (key: ChartKey) => void
  onSetType: (key: ChartKey, type: ChartType) => void
  onTogglePercent: () => void
  onSetColumns: (columns: ChartColumns) => void
  onReset: () => void
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function TypeSegmented({
  value,
  onChange,
}: {
  value: ChartType
  onChange: (type: ChartType) => void
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-line">
      {CHART_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`px-2 py-1 text-[11px] transition-colors ${
            value === type
              ? 'bg-ink text-surface'
              : 'text-ink-soft hover:text-ink'
          }`}
        >
          {CHART_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  )
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex items-center gap-2 text-[12px] text-ink-soft transition-colors hover:text-ink"
    >
      <span
        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
          checked ? 'bg-pos' : 'bg-line-strong'
        }`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-surface transition-transform ${
            checked ? 'translate-x-3.5' : 'translate-x-0.5'
          }`}
        />
      </span>
      {label}
    </button>
  )
}

function ColumnsControl({
  value,
  onChange,
}: {
  value: ChartColumns
  onChange: (columns: ChartColumns) => void
}) {
  return (
    <div className="flex items-center gap-1.5 text-[12px] text-ink-soft">
      <span>В строке</span>
      <div className="flex overflow-hidden rounded-md border border-line-strong">
        {CHART_COLUMNS.map((col) => (
          <button
            key={col}
            type="button"
            onClick={() => onChange(col)}
            className={`px-2 py-1 text-[11px] transition-colors ${
              value === col ? 'bg-ink text-surface' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {col}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ChartsToolbar({
  charts,
  showPercent,
  columns,
  onToggleVisible,
  onSetType,
  onTogglePercent,
  onSetColumns,
  onReset,
}: ChartsToolbarProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const visibleCount = charts.filter((c) => c.visible).length

  return (
    <div className="mb-5 flex flex-wrap items-center justify-end gap-4">
      <ColumnsControl value={columns} onChange={onSetColumns} />

      <Switch
        checked={showPercent}
        onChange={onTogglePercent}
        label="Проценты"
      />

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-2 rounded-md border border-line-strong px-3 py-1.5 text-[12px] text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          Графики
          <span className="rounded-full bg-line px-1.5 text-[11px] text-ink">
            {visibleCount}
          </span>
          <ChevronIcon open={open} />
        </button>

        {open && (
          <div className="absolute right-0 z-20 mt-2 w-[19rem] rounded-lg border border-line bg-surface p-2 shadow-lg">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                Графики и вид
              </span>
              <button
                type="button"
                onClick={onReset}
                className="text-[11px] text-ink-soft underline-offset-2 transition-colors hover:text-ink hover:underline"
              >
                Сбросить
              </button>
            </div>

            <ul className="flex flex-col">
              {charts.map((chart) => (
                <li
                  key={chart.key}
                  className="flex flex-col gap-2 rounded-md px-2 py-2 hover:bg-paper"
                >
                  <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink">
                    <input
                      type="checkbox"
                      checked={chart.visible}
                      onChange={() => onToggleVisible(chart.key)}
                      className="h-4 w-4 accent-[var(--color-pos)]"
                    />
                    {CHART_LABELS[chart.key]}
                  </label>
                  {chart.visible && (
                    <div className="pl-6">
                      <TypeSegmented
                        value={chart.type}
                        onChange={(type) => onSetType(chart.key, type)}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
