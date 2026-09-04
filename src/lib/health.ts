import type { FinanceState, Summary } from '../types'

export type HealthStatus = 'good' | 'warn' | 'bad' | 'neutral'

export interface HealthMetric {
  id: string
  label: string
  display: string
  status: HealthStatus
  hint: string
  /** Заполнение индикатора 0..100, если метрику уместно показать шкалой. */
  progress?: number
}

export interface RuleSlice {
  label: string
  share: number
  target: number
  status: HealthStatus
}

export interface HealthReport {
  metrics: HealthMetric[]
  /** Структура бюджета 50/30/20: необходимое / желания / остаток. */
  rule: RuleSlice[]
  /** Плавная оценка метрик, 0..100; нейтральные метрики исключены. */
  score: number
}

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value))

const sum = (items: { amount: number }[]) =>
  items.reduce((acc, item) => acc + (Number.isFinite(item.amount) ? item.amount : 0), 0)

export function computeHealth(state: FinanceState, summary: Summary): HealthReport {
  const { income, expenses, net } = summary
  // Подушка должна покрывать минимальный бюджет, а не только регулярные FC.
  const essential = sum(state.expenses.filter((e) => e.essential))
  const assets = sum(state.assets.filter((a) => a.liquid))

  // Остаток после расходов — прокси нормы сбережений, пока сбережения
  // не выделены в отдельную операцию.
  const savingsRate = income > 0 ? (net / income) * 100 : 0
  const savingsMetric: HealthMetric = {
    id: 'savings',
    label: 'Норма сбережений',
    display: income > 0 ? `${savingsRate.toFixed(1)}%` : '—',
    status:
      income <= 0 ? 'neutral' : savingsRate >= 20 ? 'good' : savingsRate >= 10 ? 'warn' : 'bad',
    hint:
      income <= 0
        ? 'Добавьте доходы, чтобы оценить'
        : savingsRate >= 20
          ? 'Отлично — откладываете больше 20%'
          : savingsRate >= 10
            ? 'Неплохо, но стоит дотянуть до 20%'
            : savingsRate >= 0
              ? 'Низкий запас — почти всё уходит на расходы'
              : 'Расходы превышают доход',
    progress: clamp(savingsRate),
  }

  // --- Финансовая подушка: на сколько месяцев хватит ликвидных активов ---
  const runway = essential > 0 ? assets / essential : assets > 0 ? Infinity : 0
  const runwayDisplay =
    essential <= 0
      ? assets > 0
        ? '∞'
        : '—'
      : `${runway.toFixed(1)} мес.`
  const runwayMetric: HealthMetric = {
    id: 'runway',
    label: 'Финансовая подушка',
    display: runwayDisplay,
    status:
      essential <= 0
        ? assets > 0
          ? 'good'
          : 'neutral'
        : runway >= 6
          ? 'good'
          : runway >= 3
            ? 'warn'
            : 'bad',
    hint:
      essential <= 0
        ? 'Добавьте необходимые расходы для расчёта'
        : runway >= 6
          ? 'Хватит на 6+ месяцев минимального бюджета'
          : runway >= 3
            ? 'Желательно накопить на 6 месяцев'
            : 'Подушки почти нет — цель 3–6 месяцев',
    progress: Number.isFinite(runway) ? clamp((runway / 6) * 100) : 100,
  }

  // --- Нагрузка расходов на доход (меньше — лучше) ---
  const expenseRatio = income > 0 ? (expenses / income) * 100 : 0
  const expenseMetric: HealthMetric = {
    id: 'expense-ratio',
    label: 'Расходы к доходу',
    display: income > 0 ? `${expenseRatio.toFixed(1)}%` : '—',
    status:
      income <= 0 ? 'neutral' : expenseRatio <= 70 ? 'good' : expenseRatio <= 90 ? 'warn' : 'bad',
    hint:
      income <= 0
        ? 'Добавьте доходы, чтобы оценить'
        : expenseRatio <= 70
          ? 'Расходы под контролем'
          : expenseRatio <= 90
            ? 'Расходы съедают большую часть дохода'
            : 'Почти весь доход уходит на расходы',
    progress: clamp(expenseRatio),
  }

  // --- Структура бюджета вместо механического FC/VC ---
  const needsShare = income > 0 ? (essential / income) * 100 : 0
  const wantsShare = income > 0 ? ((expenses - essential) / income) * 100 : 0
  const savingsShare = income > 0 ? (net / income) * 100 : 0

  const rule: RuleSlice[] = [
    {
      label: 'Необходимое',
      share: needsShare,
      target: 50,
      status: income <= 0 ? 'neutral' : needsShare <= 50 ? 'good' : needsShare <= 60 ? 'warn' : 'bad',
    },
    {
      label: 'Желания',
      share: wantsShare,
      target: 30,
      status: income <= 0 ? 'neutral' : wantsShare <= 30 ? 'good' : wantsShare <= 40 ? 'warn' : 'bad',
    },
    {
      label: 'Остаток / сбережения',
      share: savingsShare,
      target: 20,
      status:
        income <= 0 ? 'neutral' : savingsShare >= 20 ? 'good' : savingsShare >= 10 ? 'warn' : 'bad',
    },
  ]

  const metrics = [savingsMetric, runwayMetric, expenseMetric]
  const rated = metrics.filter((m) => m.status !== 'neutral')
  const metricScores = rated.map((metric) => {
    if (metric.id === 'savings') return clamp((savingsRate / 20) * 100)
    if (metric.id === 'runway') return Number.isFinite(runway) ? clamp((runway / 6) * 100) : 100
    return clamp(((100 - expenseRatio) / 30) * 100)
  })
  const score = metricScores.length > 0
    ? Math.round(metricScores.reduce((total, value) => total + value, 0) / metricScores.length)
    : 0

  return { metrics, rule, score }
}
