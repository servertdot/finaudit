import { useMemo } from 'react'
import type { FinanceState, Summary } from '../types'
import type { Theme } from '../lib/theme'
import {
  CHART_LABELS,
  useChartsSettings,
  type ChartColumns,
  type ChartKey,
} from '../lib/chartsConfig'
import { Panel } from './Panel'
import { ChartIcon } from './icons'
import { ChartCard, type ChartDatum, type ChartTokens } from './ChartCard'
import { ChartsToolbar } from './ChartsToolbar'

const THEMES: Record<Theme, ChartTokens & { palette: string[]; fc: string; vc: string }> = {
  light: {
    palette: ['#007aff', '#ff453a', '#ff9f0a', '#30b0c7', '#af52de', '#ff375f', '#34c759', '#8e8e93'],
    pos: '#248a3d',
    neg: '#d70015',
    fc: '#007aff',
    vc: '#ff9f0a',
    tickStrong: '#515154',
    tickSoft: '#86868b',
    axis: '#e8e8ed',
    cursor: 'rgba(29,29,31,0.04)',
    tipBg: '#ffffff',
    tipBorder: '#d2d2d7',
    tipText: '#1d1d1f',
    legend: '#515154',
  },
  dark: {
    palette: ['#0a84ff', '#ff453a', '#ff9f0a', '#64d2ff', '#bf5af2', '#ff375f', '#30d158', '#8e8e93'],
    pos: '#30d158',
    neg: '#ff453a',
    fc: '#0a84ff',
    vc: '#ff9f0a',
    tickStrong: '#d1d1d6',
    tickSoft: '#8e8e93',
    axis: '#323234',
    cursor: 'rgba(255,255,255,0.05)',
    tipBg: '#1c1c1e',
    tipBorder: '#48484a',
    tipText: '#f5f5f7',
    legend: '#d1d1d6',
  },
}

const GRID_BY_COLUMNS: Record<ChartColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
}

interface ChartsPanelProps {
  state: FinanceState
  summary: Summary
  theme: Theme
}

interface Dataset {
  data: ChartDatum[]
  colors: string[]
}

export function ChartsPanel({ state, summary, theme }: ChartsPanelProps) {
  const t = THEMES[theme]
  const {
    settings,
    toggleVisible,
    setType,
    togglePercent,
    setColumns,
    resetSettings,
  } = useChartsSettings()

  const byCategory = (
    items: { name: string; amount: number }[],
  ): Dataset => {
    const data = items
      .filter((i) => i.amount > 0)
      .map((i) => ({ name: i.name || '—', value: i.amount }))
      .sort((a, b) => b.value - a.value)
    return { data, colors: data.map((_, i) => t.palette[i % t.palette.length]) }
  }

  const datasets = useMemo<Record<ChartKey, Dataset>>(() => {
    return {
      expensesByCategory: byCategory(state.expenses),
      incomesByCategory: byCategory(state.incomes),
      assetsByCategory: byCategory(state.assets),
      fixedVsVariable: {
        data: [
          { name: 'Постоянные (FC)', value: summary.fixed },
          { name: 'Переменные (VC)', value: summary.variable },
        ].filter((d) => d.value > 0),
        colors: [t.fc, t.vc],
      },
      incomeVsExpense: {
        data: [
          { name: 'Доходы', value: summary.income },
          { name: 'Расходы', value: summary.expenses },
        ],
        colors: [t.pos, t.neg],
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, summary, theme])

  const visibleCharts = settings.charts.filter((c) => c.visible)
  const hasAnyData =
    summary.income > 0 ||
    summary.expenses > 0 ||
    datasets.assetsByCategory.data.length > 0

  return (
    <Panel
      title="Аналитика и графики"
      accent="indigo"
      icon={<ChartIcon size={18} className="text-ink" />}
      className="col-span-1 lg:col-span-2"
    >
      <ChartsToolbar
        charts={settings.charts}
        showPercent={settings.showPercent}
        columns={settings.columns}
        onToggleVisible={toggleVisible}
        onSetType={setType}
        onTogglePercent={togglePercent}
        onSetColumns={setColumns}
        onReset={resetSettings}
      />

      {!hasAnyData ? (
        <p className="py-10 text-center text-sm text-muted">
          Добавьте доходы и расходы, чтобы увидеть графики.
        </p>
      ) : visibleCharts.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          Не выбрано ни одного графика. Откройте «Графики», чтобы выбрать.
        </p>
      ) : (
        <div className={`grid gap-8 ${GRID_BY_COLUMNS[settings.columns]}`}>
          {visibleCharts.map((chart) => (
            <ChartCard
              key={chart.key}
              title={CHART_LABELS[chart.key]}
              type={chart.type}
              data={datasets[chart.key].data}
              colors={datasets[chart.key].colors}
              tokens={t}
              showPercent={settings.showPercent}
              columns={settings.columns}
            />
          ))}
        </div>
      )}
    </Panel>
  )
}
