import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReactNode } from 'react'
import { formatMoney } from '../lib/format'
import type { ChartColumns, ChartType } from '../lib/chartsConfig'

export interface ChartDatum {
  name: string
  value: number
}

export interface ChartTokens {
  pos: string
  neg: string
  tickStrong: string
  tickSoft: string
  axis: string
  cursor: string
  tipBg: string
  tipBorder: string
  tipText: string
  legend: string
}

interface ChartCardProps {
  title: string
  type: ChartType
  data: ChartDatum[]
  colors: string[]
  tokens: ChartTokens
  showPercent: boolean
  columns: ChartColumns
}

const chartTitleClass =
  'mb-3 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted'

const SIZE_BY_COLUMNS: Record<
  ChartColumns,
  { heightClass: string; outerRadius: number; donutInner: number }
> = {
  1: { heightClass: 'h-[460px]', outerRadius: 170, donutInner: 105 },
  2: { heightClass: 'h-80', outerRadius: 110, donutInner: 65 },
  3: { heightClass: 'h-64', outerRadius: 80, donutInner: 45 },
}

export function ChartCard({
  title,
  type,
  data,
  colors,
  tokens,
  showPercent,
  columns,
}: ChartCardProps) {
  const size = SIZE_BY_COLUMNS[columns]
  const tooltipStyle = {
    borderRadius: 8,
    border: `1px solid ${tokens.tipBorder}`,
    background: tokens.tipBg,
    fontSize: 12,
    color: tokens.tipText,
    boxShadow: 'none',
  }

  const total = data.reduce((acc, d) => acc + d.value, 0)

  const formatValue = (
    value: number | string | ReadonlyArray<number | string> | undefined,
  ): string => {
    const num = Number(Array.isArray(value) ? value[0] : value)
    if (showPercent && total > 0) {
      return `${formatMoney(num)} · ${((num / total) * 100).toFixed(1)}%`
    }
    return formatMoney(num)
  }

  const legendFormatter = (v: string) => (
    <span style={{ color: tokens.legend, fontSize: 11 }}>{v}</span>
  )

  const renderChart = () => {
    if (type === 'bar') {
      return (
        <BarChart data={data} barCategoryGap="25%">
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: tokens.tickStrong }}
            axisLine={{ stroke: tokens.axis }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: tokens.tickSoft }}
            width={48}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={formatValue}
            contentStyle={tooltipStyle}
            itemStyle={{ color: tokens.tipText }}
            labelStyle={{ color: tokens.tipText }}
            cursor={{ fill: tokens.cursor }}
          />
          <Bar dataKey="value" name="Сумма" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
            {showPercent && total > 0 && (
              <LabelList
                dataKey="value"
                position="top"
                formatter={(value: ReactNode) =>
                  `${((Number(value) / total) * 100).toFixed(1)}%`
                }
                style={{ fontSize: 11, fill: tokens.tickSoft }}
              />
            )}
          </Bar>
        </BarChart>
      )
    }

    return (
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={size.outerRadius}
          innerRadius={type === 'donut' ? size.donutInner : 0}
          paddingAngle={type === 'donut' ? 2 : 0}
          label={
            showPercent
              ? ({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`
              : undefined
          }
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={formatValue}
          contentStyle={tooltipStyle}
          itemStyle={{ color: tokens.tipText }}
          labelStyle={{ color: tokens.tipText }}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 11 }}
          formatter={legendFormatter}
        />
      </PieChart>
    )
  }

  return (
    <div className="flex flex-col">
      <h3 className={chartTitleClass}>{title}</h3>
      <div className={size.heightClass}>
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-xs text-muted">
            Нет данных для этого графика.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
