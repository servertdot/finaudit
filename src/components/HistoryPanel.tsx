import type { ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DeltaStat, HistoryReport, InsightTone } from '../lib/history'
import type { Theme } from '../lib/theme'
import { formatMoney, formatPercent } from '../lib/format'
import { Panel } from './Panel'
import { TrendIcon } from './icons'

interface HistoryTokens {
  income: string
  expense: string
  assets: string
  fc: string
  vc: string
  rate: string
  grid: string
  tick: string
  tipBg: string
  tipBorder: string
  tipText: string
  legend: string
}

const TOKENS: Record<Theme, HistoryTokens> = {
  light: {
    income: '#248a3d',
    expense: '#d70015',
    assets: '#007aff',
    fc: '#007aff',
    vc: '#ff9f0a',
    rate: '#af52de',
    grid: '#e8e8ed',
    tick: '#86868b',
    tipBg: '#ffffff',
    tipBorder: '#d2d2d7',
    tipText: '#1d1d1f',
    legend: '#515154',
  },
  dark: {
    income: '#30d158',
    expense: '#ff453a',
    assets: '#0a84ff',
    fc: '#0a84ff',
    vc: '#ff9f0a',
    rate: '#bf5af2',
    grid: '#323234',
    tick: '#8e8e93',
    tipBg: '#1c1c1e',
    tipBorder: '#48484a',
    tipText: '#f5f5f7',
    legend: '#d1d1d6',
  },
}

const compactFmt = new Intl.NumberFormat('ru-RU', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const chartTitleClass =
  'mb-3 text-center text-[13px] font-semibold tracking-[-0.01em] text-ink-soft'

const toneClass: Record<InsightTone, string> = {
  good: 'text-pos',
  bad: 'text-neg',
  neutral: 'text-ink-soft',
}

function DeltaBadge({ stat }: { stat: DeltaStat }) {
  const { delta, goodWhen } = stat
  // Около-нулевое изменение трактуем как «без изменений», а не как падение.
  const flat = delta === null || Math.abs(delta) < 0.5
  const up = (delta ?? 0) > 0
  const isGood = flat ? null : goodWhen === 'up' ? up : !up
  const color = isGood === null ? 'text-muted' : isGood ? 'text-pos' : 'text-neg'
  const arrow = flat ? '→' : up ? '▲' : '▼'
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-muted">{stat.label}</span>
      <span className="font-display text-xl leading-none tabular-nums text-ink">
        {formatMoney(stat.value)}
      </span>
      {delta !== null && (
        <span className={`text-[12px] tabular-nums ${color}`}>
          {arrow} {Math.abs(delta).toFixed(0)}% к пред.
        </span>
      )}
    </div>
  )
}

export function HistoryPanel({ history, theme }: { history: HistoryReport; theme: Theme }) {
  const t = TOKENS[theme]

  const tooltipStyle = {
    borderRadius: 12,
    border: `1px solid ${t.tipBorder}`,
    background: t.tipBg,
    fontSize: 12,
    color: t.tipText,
    boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
  }

  const moneyTip = (value: number | string | ReadonlyArray<number | string> | undefined) =>
    formatMoney(Number(Array.isArray(value) ? value[0] : value))
  const rateTip = (value: number | string | ReadonlyArray<number | string> | undefined) =>
    formatPercent(Number(Array.isArray(value) ? value[0] : value))

  const axisProps = {
    tick: { fontSize: 11, fill: t.tick },
    axisLine: { stroke: t.grid },
    tickLine: false,
  }
  const yAxisProps = {
    tick: { fontSize: 11, fill: t.tick },
    width: 52,
    axisLine: false,
    tickLine: false,
    tickFormatter: (v: number) => compactFmt.format(v),
  }
  const legendFormatter = (v: ReactNode) => (
    <span style={{ color: t.legend, fontSize: 11 }}>{v}</span>
  )

  return (
    <Panel
      title="Динамика по месяцам"
      accent="emerald"
      icon={<TrendIcon size={18} className="text-pos" />}
      className="col-span-1 lg:col-span-2"
    >
      {!history.hasEnough ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <p className="text-sm text-muted">
            Динамика появится, когда будет хотя бы два месяца.
          </p>
          <p className="text-[12px] text-muted">
            Нажмите «Новый месяц» на панели периода, чтобы добавить следующий снимок.
          </p>
        </div>
      ) : (
        <>
          {/* Бейджи: текущий месяц против предыдущего */}
          <div className="mb-6 grid grid-cols-2 gap-4 border-b border-line pb-6 sm:grid-cols-4">
            {history.deltas.map((stat) => (
              <DeltaBadge key={stat.label} stat={stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Чистый капитал */}
            <div className="flex flex-col">
              <h3 className={chartTitleClass}>Чистый капитал (активы)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history.points}>
                    <defs>
                      <linearGradient id="assetsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={t.assets} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={t.assets} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={t.grid} vertical={false} />
                    <XAxis dataKey="label" {...axisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip
                      formatter={moneyTip}
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: t.tipText }}
                      labelStyle={{ color: t.tipText }}
                    />
                    <Area
                      type="monotone"
                      dataKey="assets"
                      name="Активы"
                      stroke={t.assets}
                      strokeWidth={2}
                      fill="url(#assetsFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Доходы vs Расходы */}
            <div className="flex flex-col">
              <h3 className={chartTitleClass}>Доходы и расходы</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={history.points} barGap={4}>
                    <CartesianGrid stroke={t.grid} vertical={false} />
                    <XAxis dataKey="label" {...axisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip
                      formatter={moneyTip}
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: t.tipText }}
                      labelStyle={{ color: t.tipText }}
                      cursor={{ fill: 'transparent' }}
                    />
                    <Legend formatter={legendFormatter} iconType="circle" />
                    <Bar dataKey="income" name="Доходы" fill={t.income} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="expenses" name="Расходы" fill={t.expense} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Структура расходов FC/VC */}
            <div className="flex flex-col">
              <h3 className={chartTitleClass}>Структура расходов (FC / VC)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history.points}>
                    <CartesianGrid stroke={t.grid} vertical={false} />
                    <XAxis dataKey="label" {...axisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip
                      formatter={moneyTip}
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: t.tipText }}
                      labelStyle={{ color: t.tipText }}
                    />
                    <Legend formatter={legendFormatter} iconType="circle" />
                    <Area
                      type="monotone"
                      dataKey="fixed"
                      name="Постоянные (FC)"
                      stackId="exp"
                      stroke={t.fc}
                      strokeWidth={2}
                      fill={t.fc}
                      fillOpacity={0.25}
                    />
                    <Area
                      type="monotone"
                      dataKey="variable"
                      name="Переменные (VC)"
                      stackId="exp"
                      stroke={t.vc}
                      strokeWidth={2}
                      fill={t.vc}
                      fillOpacity={0.25}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Норма сбережений */}
            <div className="flex flex-col">
              <h3 className={chartTitleClass}>Норма сбережений, %</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history.points}>
                    <CartesianGrid stroke={t.grid} vertical={false} />
                    <XAxis dataKey="label" {...axisProps} />
                    <YAxis
                      tick={{ fontSize: 11, fill: t.tick }}
                      width={44}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                    />
                    <Tooltip
                      formatter={rateTip}
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: t.tipText }}
                      labelStyle={{ color: t.tipText }}
                    />
                    <Line
                      type="monotone"
                      dataKey="savingsRate"
                      name="Норма сбережений"
                      stroke={t.rate}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: t.rate }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Инсайты */}
          {history.insights.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <h3 className="mb-3 text-[13px] font-semibold text-ink">
                Наблюдения
              </h3>
              <ul className="flex flex-col gap-2">
                {history.insights.map((insight) => (
                  <li key={insight.id} className="flex items-start gap-2.5 text-[13px]">
                    <span className={`mt-0.5 ${toneClass[insight.tone]}`}>
                      {insight.tone === 'good' ? '▲' : insight.tone === 'bad' ? '▼' : '•'}
                    </span>
                    <span className="text-ink-soft">{insight.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Panel>
  )
}
