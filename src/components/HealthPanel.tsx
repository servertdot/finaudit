import type { ReactNode } from 'react'
import type { HealthMetric, HealthReport, HealthStatus, RuleSlice } from '../lib/health'
import { Panel } from './Panel'
import { InfoHint } from './InfoHint'
import { HeartPulseIcon } from './icons'

function Formula({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-paper px-1.5 py-0.5 font-mono text-[11px] text-ink">
      {children}
    </span>
  )
}

const METRIC_HINTS: Record<string, ReactNode> = {
  savings: (
    <>
      <p>Какая доля дохода остаётся после всех расходов за месяц.</p>
      <p>
        <Formula>(Доходы − Расходы) / Доходы × 100%</Formula>
      </p>
      <p>Ориентир: ≥ 20% — отлично, 10–20% — средне, &lt; 10% — мало.</p>
    </>
  ),
  runway: (
    <>
      <p>
        На сколько месяцев хватит ваших активов, если доход пропадёт, при текущих
        обязательных тратах.
      </p>
      <p>
        <Formula>Сумма активов / Постоянные расходы (FC)</Formula>
      </p>
      <p>
        Берутся только постоянные расходы (FC) как обязательные. Ориентир: 6+ мес. —
        отлично, 3–6 — средне, &lt; 3 — мало.
      </p>
    </>
  ),
  'expense-ratio': (
    <>
      <p>Какую часть дохода съедают все расходы.</p>
      <p>
        <Formula>Расходы / Доходы × 100%</Formula>
      </p>
      <p>Ориентир: ≤ 70% — хорошо, 70–90% — средне, &gt; 90% — много.</p>
    </>
  ),
}

const statusText: Record<HealthStatus, string> = {
  good: 'text-pos',
  warn: 'text-warn',
  bad: 'text-neg',
  neutral: 'text-muted',
}

const statusBar: Record<HealthStatus, string> = {
  good: 'bg-pos',
  warn: 'bg-warn',
  bad: 'bg-neg',
  neutral: 'bg-line-strong',
}

const statusDot: Record<HealthStatus, string> = {
  good: 'bg-pos',
  warn: 'bg-warn',
  bad: 'bg-neg',
  neutral: 'bg-muted',
}

function MetricCard({ metric }: { metric: HealthMetric }) {
  const hint = METRIC_HINTS[metric.id]
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-paper/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[12px] text-ink-soft">
          {metric.label}
          {hint && (
            <InfoHint title={metric.label} align="left">
              {hint}
            </InfoHint>
          )}
        </span>
        <span className={`h-2 w-2 shrink-0 rounded-full ${statusDot[metric.status]}`} />
      </div>
      <span className={`font-display text-3xl leading-none tabular-nums ${statusText[metric.status]}`}>
        {metric.display}
      </span>
      {typeof metric.progress === 'number' && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className={`h-full rounded-full transition-all ${statusBar[metric.status]}`}
            style={{ width: `${metric.progress}%` }}
          />
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-muted">{metric.hint}</p>
    </div>
  )
}

function RuleRow({ slice }: { slice: RuleSlice }) {
  const fill = Math.min(100, Math.max(0, slice.share))
  const targetPos = Math.min(100, Math.max(0, slice.target))
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2 text-[12px]">
        <span className="text-ink-soft">{slice.label}</span>
        <span className={`tabular-nums ${statusText[slice.status]}`}>
          {slice.share.toFixed(0)}%
          <span className="text-muted"> / цель {slice.target}%</span>
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full transition-all ${statusBar[slice.status]}`}
          style={{ width: `${fill}%` }}
        />
        <span
          className="absolute top-0 h-full w-px bg-ink/40"
          style={{ left: `${targetPos}%` }}
          aria-hidden
        />
      </div>
    </div>
  )
}

export function HealthPanel({ health }: { health: HealthReport }) {
  const scoreStatus: HealthStatus =
    health.score >= 67 ? 'good' : health.score >= 34 ? 'warn' : 'bad'

  return (
    <Panel
      title="Здоровье финансов"
      accent="emerald"
      icon={<HeartPulseIcon size={18} className="text-pos" />}
    >
      <div className="mb-5 flex items-end justify-between gap-3 border-b border-line pb-5">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
            Общая оценка
            <InfoHint title="Общая оценка" align="left">
              <p>
                Доля метрик в «зелёной» зоне среди тех, что можно оценить (где есть
                доходы и расходы).
              </p>
              <p>0 — все метрики в красной зоне, 100 — все в зелёной.</p>
            </InfoHint>
          </span>
          <span className={`font-display text-5xl leading-none tabular-nums ${statusText[scoreStatus]}`}>
            {health.score}
            <span className="text-2xl text-muted"> / 100</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {health.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">
            Правило 50/30/20
            <InfoHint title="Правило 50/30/20" align="left">
              <p>
                Модель распределения дохода: 50% — на нужды (обязательные, FC), 30% — на
                желания (переменные, VC), 20% — в сбережения.
              </p>
              <p>
                Полоска — ваша фактическая доля от дохода, вертикальная риска — цель.
              </p>
            </InfoHint>
          </h3>
          <span className="text-[11px] text-muted">доля от дохода</span>
        </div>
        <div className="flex flex-col gap-3">
          {health.rule.map((slice) => (
            <RuleRow key={slice.label} slice={slice} />
          ))}
        </div>
      </div>
    </Panel>
  )
}
