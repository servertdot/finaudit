import type { Summary } from '../types'
import { formatMoney, formatPercent } from '../lib/format'
import { Panel } from './Panel'
import { TrendIcon } from './icons'

interface SummaryRowProps {
  label: string
  value: string
  valueClass?: string
  emphasis?: boolean
}

function Row({ label, value, valueClass = 'text-ink', emphasis = false }: SummaryRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 last:border-b-0">
      <span className={`text-[13px] ${emphasis ? 'text-ink' : 'text-ink-soft'}`}>
        {label}
      </span>
      <span className={`text-[15px] font-medium tabular-nums ${valueClass}`}>
        {value}
      </span>
    </div>
  )
}

export function SummaryPanel({ summary }: { summary: Summary }) {
  const positive = summary.freeBalance >= 0
  return (
    <Panel
      title="Сводка"
      accent="indigo"
      icon={<TrendIcon size={18} className="text-ink" />}
    >
      {/* Герой: свободный остаток */}
      <div className="mb-5 flex flex-col gap-1 border-b border-line pb-5">
        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          Свободный остаток
        </span>
        <div className="flex items-baseline gap-2">
          <span
            className={`font-display text-5xl leading-none tabular-nums ${
              positive ? 'text-ink' : 'text-neg'
            }`}
          >
            {formatMoney(summary.freeBalance)}
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <Row label="Доходы" value={formatMoney(summary.income)} valueClass="text-pos" />
        <Row
          label="Расходы"
          value={formatMoney(summary.expenses)}
          valueClass="text-neg"
        />
        <Row
          label="Доход − расход"
          value={formatMoney(summary.net)}
          emphasis
          valueClass={summary.net >= 0 ? 'text-pos' : 'text-neg'}
        />
        <Row label="Переменные расходы (VC)" value={formatMoney(summary.variable)} />
        <Row label="Постоянные расходы (FC)" value={formatMoney(summary.fixed)} />
        <Row label="Доля VC в расходах" value={formatPercent(summary.variableShare)} />
        <Row label="Доля FC в расходах" value={formatPercent(summary.fixedShare)} />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        VC — Variable Costs (переменные) · FC — Fixed Costs (постоянные)
      </p>
    </Panel>
  )
}
