import type { FinanceData, MonthlySnapshot } from '../types'
import { computeSummary } from './calc'
import { compareMonthAsc, formatMonth, formatMonthShort, monthsBetween } from './period'

export interface MonthPoint {
  month: string
  label: string
  income: number
  expenses: number
  net: number
  fixed: number
  variable: number
  assets: number
  savingsRate: number
}

export type InsightTone = 'good' | 'bad' | 'neutral'

export interface Insight {
  id: string
  text: string
  tone: InsightTone
}

export interface DeltaStat {
  label: string
  value: number
  delta: number | null
  /** Положительная ли динамика по смыслу (для расходов рост = плохо). */
  goodWhen: 'up' | 'down'
}

export interface HistoryReport {
  points: MonthPoint[]
  insights: Insight[]
  deltas: DeltaStat[]
  hasEnough: boolean
}

const sum = (items: { amount: number }[]) =>
  items.reduce((acc, item) => acc + (Number.isFinite(item.amount) ? item.amount : 0), 0)

function toPoint(snapshot: MonthlySnapshot): MonthPoint {
  const summary = computeSummary({ user: '', ...snapshot })
  const assets = sum(snapshot.assets)
  return {
    month: snapshot.month,
    label: formatMonthShort(snapshot.month),
    income: summary.income,
    expenses: summary.expenses,
    net: summary.net,
    fixed: summary.fixed,
    variable: summary.variable,
    assets,
    savingsRate: summary.income > 0 ? (summary.net / summary.income) * 100 : 0,
  }
}

function pct(from: number, to: number): number | null {
  if (from === 0) return null
  return ((to - from) / Math.abs(from)) * 100
}

function buildDeltas(points: MonthPoint[]): DeltaStat[] {
  const last = points[points.length - 1]
  const prev = points.length >= 2 ? points[points.length - 2] : null
  const stat = (
    label: string,
    pick: (p: MonthPoint) => number,
    goodWhen: 'up' | 'down',
  ): DeltaStat => ({
    label,
    value: pick(last),
    delta: prev ? pct(pick(prev), pick(last)) : null,
    goodWhen,
  })
  return [
    stat('Доходы', (p) => p.income, 'up'),
    stat('Расходы', (p) => p.expenses, 'down'),
    stat('Сбережения', (p) => p.net, 'up'),
    stat('Активы', (p) => p.assets, 'up'),
  ]
}

function buildInsights(points: MonthPoint[]): Insight[] {
  const insights: Insight[] = []
  const first = points[0]
  const last = points[points.length - 1]
  const prev = points.length >= 2 ? points[points.length - 2] : null
  const span = monthsBetween(first.month, last.month)

  // 1. Чистый капитал за период.
  const assetsDelta = last.assets - first.assets
  if (span >= 1 && Math.abs(assetsDelta) > 0) {
    const p = pct(first.assets, last.assets)
    const pctText = p === null ? '' : ` (${p >= 0 ? '+' : ''}${p.toFixed(0)}%)`
    insights.push({
      id: 'networth',
      text:
        assetsDelta >= 0
          ? `Чистый капитал вырос на ${fmt(assetsDelta)}${pctText} за ${span} мес.`
          : `Чистый капитал снизился на ${fmt(-assetsDelta)}${pctText} за ${span} мес.`,
      tone: assetsDelta >= 0 ? 'good' : 'bad',
    })
  }

  // 2. Норма сбережений: текущий месяц против предыдущего.
  if (prev) {
    const d = last.savingsRate - prev.savingsRate
    if (Math.abs(d) >= 1) {
      insights.push({
        id: 'savings-trend',
        text:
          d >= 0
            ? `Норма сбережений выросла с ${prev.savingsRate.toFixed(0)}% до ${last.savingsRate.toFixed(0)}% за месяц.`
            : `Норма сбережений упала с ${prev.savingsRate.toFixed(0)}% до ${last.savingsRate.toFixed(0)}% за месяц.`,
        tone: d >= 0 ? 'good' : 'bad',
      })
    }
  }

  // 3. Рост расходов за период.
  const expP = pct(first.expenses, last.expenses)
  if (span >= 2 && expP !== null && Math.abs(expP) >= 10) {
    insights.push({
      id: 'expenses-trend',
      text:
        expP >= 0
          ? `Расходы выросли на ${expP.toFixed(0)}% за ${span} мес. — стоит проверить, что разрослось.`
          : `Расходы снизились на ${Math.abs(expP).toFixed(0)}% за ${span} мес. — хорошая оптимизация.`,
      tone: expP >= 0 ? 'bad' : 'good',
    })
  }

  // 4. Рост постоянных расходов (FC).
  const fcP = pct(first.fixed, last.fixed)
  if (span >= 2 && fcP !== null && fcP >= 15) {
    insights.push({
      id: 'fc-trend',
      text: `Постоянные расходы (FC) выросли на ${fcP.toFixed(0)}% — пересмотрите подписки и регулярные платежи.`,
      tone: 'bad',
    })
  }

  // 5. Лучший месяц по норме сбережений.
  if (points.length >= 3) {
    const best = points.reduce((a, b) => (b.savingsRate > a.savingsRate ? b : a))
    insights.push({
      id: 'best-month',
      text: `Лучший месяц по сбережениям — ${formatMonth(best.month)} (${best.savingsRate.toFixed(0)}%).`,
      tone: 'neutral',
    })
  }

  return insights
}

const moneyFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
function fmt(n: number): string {
  return moneyFmt.format(Math.round(n))
}

export function computeHistory(data: FinanceData): HistoryReport {
  const points = [...data.months]
    .sort((a, b) => compareMonthAsc(a.month, b.month))
    .map(toPoint)

  const hasEnough = points.length >= 2

  return {
    points,
    insights: hasEnough ? buildInsights(points) : [],
    deltas: points.length > 0 ? buildDeltas(points) : [],
    hasEnough,
  }
}
