import { useCallback, useEffect, useState } from 'react'

export type ChartType = 'pie' | 'donut' | 'bar'

export type ChartKey =
  | 'expensesByCategory'
  | 'fixedVsVariable'
  | 'incomeVsExpense'
  | 'incomesByCategory'
  | 'assetsByCategory'

export interface ChartConfig {
  key: ChartKey
  visible: boolean
  type: ChartType
}

export type ChartColumns = 1 | 2 | 3

export interface ChartsSettings {
  charts: ChartConfig[]
  showPercent: boolean
  columns: ChartColumns
}

export const CHART_COLUMNS: ChartColumns[] = [1, 2, 3]

export const CHART_KEYS: ChartKey[] = [
  'expensesByCategory',
  'fixedVsVariable',
  'incomeVsExpense',
  'incomesByCategory',
  'assetsByCategory',
]

export const CHART_LABELS: Record<ChartKey, string> = {
  expensesByCategory: 'Структура расходов',
  fixedVsVariable: 'Постоянные / Переменные',
  incomeVsExpense: 'Доходы и расходы',
  incomesByCategory: 'Структура доходов',
  assetsByCategory: 'Структура активов',
}

export const CHART_TYPES: ChartType[] = ['pie', 'donut', 'bar']

export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  pie: 'Круговая',
  donut: 'Кольцевая',
  bar: 'Столбцы',
}

const DEFAULT_TYPES: Record<ChartKey, ChartType> = {
  expensesByCategory: 'donut',
  fixedVsVariable: 'donut',
  incomeVsExpense: 'bar',
  incomesByCategory: 'donut',
  assetsByCategory: 'bar',
}

const DEFAULT_VISIBLE: Record<ChartKey, boolean> = {
  expensesByCategory: true,
  fixedVsVariable: true,
  incomeVsExpense: true,
  incomesByCategory: false,
  assetsByCategory: false,
}

const SETTINGS_KEY = 'finaudit:charts'

function isChartType(value: unknown): value is ChartType {
  return value === 'pie' || value === 'donut' || value === 'bar'
}

function isChartKey(value: unknown): value is ChartKey {
  return typeof value === 'string' && (CHART_KEYS as string[]).includes(value)
}

function isColumns(value: unknown): value is ChartColumns {
  return value === 1 || value === 2 || value === 3
}

function defaultSettings(): ChartsSettings {
  return {
    charts: CHART_KEYS.map((key) => ({
      key,
      visible: DEFAULT_VISIBLE[key],
      type: DEFAULT_TYPES[key],
    })),
    showPercent: false,
    columns: 3,
  }
}

export function normalizeSettings(raw: unknown): ChartsSettings {
  if (!raw || typeof raw !== 'object') return defaultSettings()
  const obj = raw as Record<string, unknown>
  const storedCharts = Array.isArray(obj.charts) ? obj.charts : []

  const stored = new Map<ChartKey, Partial<ChartConfig>>()
  const order: ChartKey[] = []
  for (const item of storedCharts) {
    if (!item || typeof item !== 'object') continue
    const c = item as Record<string, unknown>
    if (!isChartKey(c.key) || stored.has(c.key)) continue
    stored.set(c.key, {
      visible: typeof c.visible === 'boolean' ? c.visible : undefined,
      type: isChartType(c.type) ? c.type : undefined,
    })
    order.push(c.key)
  }
  for (const key of CHART_KEYS) if (!order.includes(key)) order.push(key)

  return {
    charts: order.map((key) => ({
      key,
      visible: stored.get(key)?.visible ?? DEFAULT_VISIBLE[key],
      type: stored.get(key)?.type ?? DEFAULT_TYPES[key],
    })),
    showPercent: typeof obj.showPercent === 'boolean' ? obj.showPercent : false,
    columns: isColumns(obj.columns) ? obj.columns : 3,
  }
}

function getInitialSettings(): ChartsSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return normalizeSettings(JSON.parse(raw))
  } catch {
    /* noop */
  }
  return defaultSettings()
}

export function useChartsSettings() {
  const [settings, setSettings] = useState<ChartsSettings>(getInitialSettings)

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch {
      /* noop */
    }
  }, [settings])

  const toggleVisible = useCallback((key: ChartKey) => {
    setSettings((s) => ({
      ...s,
      charts: s.charts.map((c) =>
        c.key === key ? { ...c, visible: !c.visible } : c,
      ),
    }))
  }, [])

  const setType = useCallback((key: ChartKey, type: ChartType) => {
    setSettings((s) => ({
      ...s,
      charts: s.charts.map((c) => (c.key === key ? { ...c, type } : c)),
    }))
  }, [])

  const togglePercent = useCallback(() => {
    setSettings((s) => ({ ...s, showPercent: !s.showPercent }))
  }, [])

  const setColumns = useCallback((columns: ChartColumns) => {
    setSettings((s) => ({ ...s, columns }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings())
  }, [])

  return {
    settings,
    toggleVisible,
    setType,
    togglePercent,
    setColumns,
    resetSettings,
  }
}
