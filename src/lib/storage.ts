import type { StateStorage } from 'zustand/middleware'
import type { AssetItem, ExpenseItem, FinanceState, IncomeItem } from '../types'
import { uid } from './id'

export const STORAGE_KEY = 'finaudit:v1'

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

export function normalizeState(raw: unknown): FinanceState | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  return {
    user: typeof obj.user === 'string' ? obj.user : 'Пользователь',
    expenses: normalizeExpenses(obj.expenses),
    incomes: normalizeFlat(obj.incomes) as IncomeItem[],
    assets: normalizeFlat(obj.assets) as AssetItem[],
  }
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
      const normalized = normalizeState(parsed)
      return normalized ? JSON.stringify({ state: normalized, version: 0 }) : null
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
