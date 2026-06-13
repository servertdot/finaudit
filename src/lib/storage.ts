import type { StateStorage } from 'zustand/middleware'
import type {
  AssetItem,
  ExpenseItem,
  FinanceData,
  FinanceState,
  IncomeItem,
  MonthlySnapshot,
} from '../types'
import { uid } from './id'
import { compareMonthAsc, currentMonthKey, isMonthKey } from './period'

export const STORAGE_KEY = 'finaudit:v1'

const DEFAULT_USER = 'Пользователь'

function toNumber(value: unknown): number {
  const n = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value)
  return Number.isFinite(n) ? n : 0
}

function normalizeExpenses(raw: unknown): ExpenseItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const obj = (item ?? {}) as Record<string, unknown>
    return {
      id: typeof obj.id === 'string' ? obj.id : uid(),
      name: typeof obj.name === 'string' ? obj.name : '',
      type: obj.type === 'VC' ? 'VC' : 'FC',
      amount: toNumber(obj.amount),
    }
  })
}

function normalizeFlat(raw: unknown): (IncomeItem | AssetItem)[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const obj = (item ?? {}) as Record<string, unknown>
    return {
      id: typeof obj.id === 'string' ? obj.id : uid(),
      name: typeof obj.name === 'string' ? obj.name : '',
      amount: toNumber(obj.amount),
    }
  })
}

/** Нормализует одиночный плоский снимок (старый формат / импорт одного месяца). */
export function normalizeState(raw: unknown): FinanceState | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  return {
    user: typeof obj.user === 'string' ? obj.user : DEFAULT_USER,
    expenses: normalizeExpenses(obj.expenses),
    incomes: normalizeFlat(obj.incomes) as IncomeItem[],
    assets: normalizeFlat(obj.assets) as AssetItem[],
  }
}

function normalizeSnapshot(raw: unknown, fallbackMonth: string): MonthlySnapshot {
  const obj = (raw ?? {}) as Record<string, unknown>
  return {
    month: isMonthKey(obj.month) ? (obj.month as string) : fallbackMonth,
    note: typeof obj.note === 'string' ? obj.note : undefined,
    expenses: normalizeExpenses(obj.expenses),
    incomes: normalizeFlat(obj.incomes) as IncomeItem[],
    assets: normalizeFlat(obj.assets) as AssetItem[],
  }
}

function dedupeAndSort(months: MonthlySnapshot[]): MonthlySnapshot[] {
  const byKey = new Map<string, MonthlySnapshot>()
  for (const m of months) byKey.set(m.month, m)
  return Array.from(byKey.values()).sort((a, b) => compareMonthAsc(a.month, b.month))
}

/**
 * Приводит произвольные сохранённые/импортированные данные к FinanceData.
 * Поддерживает три формата:
 *  - новый: { user, activeMonth, months: [...] }
 *  - плоский старый: { user, expenses, incomes, assets } → один месяц (текущий)
 */
export function normalizePersisted(raw: unknown): FinanceData | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const user = typeof obj.user === 'string' ? obj.user : DEFAULT_USER

  if (Array.isArray(obj.months)) {
    const months = dedupeAndSort(
      obj.months.map((m) => normalizeSnapshot(m, currentMonthKey())),
    )
    const safeMonths = months.length > 0 ? months : [emptySnapshot(currentMonthKey())]
    const activeMonth =
      isMonthKey(obj.activeMonth) && safeMonths.some((m) => m.month === obj.activeMonth)
        ? (obj.activeMonth as string)
        : safeMonths[safeMonths.length - 1].month
    return { user, activeMonth, months: safeMonths }
  }

  // Плоский старый формат → один снимок за текущий месяц.
  const flat = normalizeState(raw)
  if (!flat) return null
  const month = currentMonthKey()
  return {
    user: flat.user,
    activeMonth: month,
    months: [{ month, expenses: flat.expenses, incomes: flat.incomes, assets: flat.assets }],
  }
}

export function emptySnapshot(month: string): MonthlySnapshot {
  return { month, expenses: [], incomes: [], assets: [] }
}

// Кастомное хранилище для zustand/persist.
// Дополнительно поддерживает старый формат (FinanceState напрямую под ключом),
// оборачивая его в структуру { state, version }, которую ожидает persist.
export const financeStorage: StateStorage = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && 'state' in parsed) {
        return raw
      }
      return JSON.stringify({ state: parsed, version: 0 })
    } catch (err) {
      console.warn('Не удалось загрузить сохранённые данные', err)
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch (err) {
      console.warn('Не удалось сохранить данные', err)
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      /* noop */
    }
  },
}
