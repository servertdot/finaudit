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
    palette: ['#2f6f5b', '#c2603f', '#d9a441', '#4a6b8a', '#8d6a9f', '#b34a5e', '#6b8e5a', '#a98a5c'],
    pos: '#1f7a55',
    neg: '#b8412f',
    fc: '#4a6b8a',
    vc: '#c2603f',
    tickStrong: '#57544a',
    tickSoft: '#8f8b7e',
    axis: '#e6e4dd',
    cursor: 'rgba(22,21,15,0.04)',
    tipBg: '#fbfbf9',
    tipBorder: '#d8d5cc',
    tipText: '#16150f',
    legend: '#57544a',
  },
  dark: {
    palette: ['#bdee63', '#f0915f', '#ecc94b', '#6db1d8', '#c08fd6', '#ee7d8f', '#9fd06a', '#d6b15f'],
    pos: '#bdee63',
    neg: '#f08a6f',
    fc: '#6db1d8',
    vc: '#f0915f',
    tickStrong: '#bcc8a8',
    tickSoft: '#899679',
    axis: '#2a3a1d',
    cursor: 'rgba(255,255,255,0.05)',
    tipBg: '#18230f',
    tipBorder: '#3b4f29',
    tipText: '#f1f4ea',
    legend: '#bcc8a8',
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
