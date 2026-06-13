import type { HealthMetric, HealthReport, HealthStatus, RuleSlice } from '../lib/health'
import { Panel } from './Panel'
import { HeartPulseIcon } from './icons'

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
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-paper/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] text-ink-soft">{metric.label}</span>
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
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
            Общая оценка
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
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">
            Правило 50/30/20
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
