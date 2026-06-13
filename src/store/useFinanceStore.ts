import { useMemo } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type {
  AssetItem,
  ExpenseItem,
  ExpenseType,
  FinanceState,
  IncomeItem,
  Summary,
} from '../types'
import { computeSummary } from '../lib/calc'
import { computeHealth, type HealthReport } from '../lib/health'
import { uid } from '../lib/id'
import { createSampleData } from '../lib/sampleData'
import { STORAGE_KEY, financeStorage, normalizeState } from '../lib/storage'

interface FinanceActions {
  setUser: (user: string) => void
  addExpense: () => void
  updateExpense: (id: string, patch: Partial<Omit<ExpenseItem, 'id'>>) => void
  removeExpense: (id: string) => void
  addIncome: () => void
  updateIncome: (id: string, patch: Partial<Omit<IncomeItem, 'id'>>) => void
  removeIncome: (id: string) => void
  addAsset: () => void
  updateAsset: (id: string, patch: Partial<Omit<AssetItem, 'id'>>) => void
  removeAsset: (id: string) => void
  replaceState: (next: FinanceState) => void
  resetToSample: () => void
  clearAll: () => void
}

export type FinanceStore = FinanceState & FinanceActions

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      ...createSampleData(),

      setUser: (user) => set({ user }),

      // --- Расходы ---
      addExpense: () =>
        set((s) => ({
          expenses: [...s.expenses, { id: uid(), name: '', type: 'FC', amount: 0 }],
        })),
      updateExpense: (id, patch) =>
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      removeExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      // --- Доходы ---
      addIncome: () =>
        set((s) => ({ incomes: [...s.incomes, { id: uid(), name: '', amount: 0 }] })),
      updateIncome: (id, patch) =>
        set((s) => ({
          incomes: s.incomes.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      removeIncome: (id) =>
        set((s) => ({ incomes: s.incomes.filter((i) => i.id !== id) })),

      // --- Активы ---
      addAsset: () =>
        set((s) => ({ assets: [...s.assets, { id: uid(), name: '', amount: 0 }] })),
      updateAsset: (id, patch) =>
        set((s) => ({
          assets: s.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      removeAsset: (id) =>
        set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),

      replaceState: (next) =>
        set({
          user: next.user,
          expenses: next.expenses,
          incomes: next.incomes,
          assets: next.assets,
        }),
      resetToSample: () => set(createSampleData()),
      clearAll: () => set((s) => ({ user: s.user, expenses: [], incomes: [], assets: [] })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => financeStorage),
      partialize: (s) => ({
        user: s.user,
        expenses: s.expenses,
        incomes: s.incomes,
        assets: s.assets,
      }),
      // Нормализуем сохранённые данные при гидрации, сохраняя экшены из текущего состояния.
      merge: (persisted, current) => ({ ...current, ...(normalizeState(persisted) ?? {}) }),
    },
  ),
)

const selectState = (s: FinanceStore): FinanceState => ({
  user: s.user,
  expenses: s.expenses,
  incomes: s.incomes,
  assets: s.assets,
})

const selectActions = (s: FinanceStore): FinanceActions => ({
  setUser: s.setUser,
  addExpense: s.addExpense,
  updateExpense: s.updateExpense,
  removeExpense: s.removeExpense,
  addIncome: s.addIncome,
  updateIncome: s.updateIncome,
  removeIncome: s.removeIncome,
  addAsset: s.addAsset,
  updateAsset: s.updateAsset,
  removeAsset: s.removeAsset,
  replaceState: s.replaceState,
  resetToSample: s.resetToSample,
  clearAll: s.clearAll,
})

export function useFinanceState(): FinanceState {
  return useFinanceStore(useShallow(selectState))
}

export function useFinanceActions(): FinanceActions {
  return useFinanceStore(useShallow(selectActions))
}

export function useFinanceSummary(): Summary {
  return useFinanceStore(useShallow((s) => computeSummary(s)))
}

export function useFinanceHealth(): HealthReport {
  const state = useFinanceState()
  const summary = useFinanceSummary()
  // computeHealth возвращает объект с вложенными массивами — мемоизируем,
  // чтобы не отдавать новую ссылку на каждый рендер (иначе бесконечный цикл).
  return useMemo(() => computeHealth(state, summary), [state, summary])
}

export type { ExpenseType }
