import { useMemo } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type {
  AssetItem,
  ExpenseItem,
  ExpenseType,
  FinanceData,
  FinanceState,
  IncomeItem,
  MonthlySnapshot,
  Summary,
} from '../types'
import { computeSummary } from '../lib/calc'
import { computeHealth, type HealthReport } from '../lib/health'
import { computeHistory, type HistoryReport } from '../lib/history'
import { uid } from '../lib/id'
import { compareMonthAsc, nextMonth } from '../lib/period'
import { createEmptyData, createSampleData } from '../lib/sampleData'
import { STORAGE_KEY, financeStorage, normalizePersisted } from '../lib/storage'

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
  // --- Периоды ---
  setActiveMonth: (month: string) => void
  addMonth: () => void
  removeMonth: (month: string) => void
  setMonthNote: (note: string) => void
  // --- Данные целиком ---
  importData: (data: FinanceData) => void
  resetToSample: () => void
  clearAll: () => void
}

export type FinanceStore = FinanceData & FinanceActions

function findActive(s: FinanceData): MonthlySnapshot {
  return s.months.find((m) => m.month === s.activeMonth) ?? s.months[0]
}

/** Применяет преобразование к активному снимку, не трогая остальные. */
function patchActive(
  s: FinanceData,
  fn: (snap: MonthlySnapshot) => MonthlySnapshot,
): Partial<FinanceData> {
  return {
    months: s.months.map((m) => (m.month === s.activeMonth ? fn(m) : m)),
  }
}

function cloneSnapshot(src: MonthlySnapshot, month: string): MonthlySnapshot {
  return {
    month,
    expenses: src.expenses.map((e) => ({ ...e, id: uid() })),
    incomes: src.incomes.map((i) => ({ ...i, id: uid() })),
    assets: src.assets.map((a) => ({ ...a, id: uid() })),
  }
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      ...createSampleData(),

      setUser: (user) => set({ user }),

      // --- Расходы ---
      addExpense: () =>
        set((s) =>
          patchActive(s, (snap) => ({
            ...snap,
            expenses: [...snap.expenses, { id: uid(), name: '', type: 'FC', amount: 0 }],
          })),
        ),
      updateExpense: (id, patch) =>
        set((s) =>
          patchActive(s, (snap) => ({
            ...snap,
            expenses: snap.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          })),
        ),
      removeExpense: (id) =>
        set((s) =>
          patchActive(s, (snap) => ({
            ...snap,
            expenses: snap.expenses.filter((e) => e.id !== id),
          })),
        ),

      // --- Доходы ---
      addIncome: () =>
        set((s) =>
          patchActive(s, (snap) => ({
            ...snap,
            incomes: [...snap.incomes, { id: uid(), name: '', amount: 0 }],
          })),
        ),
      updateIncome: (id, patch) =>
        set((s) =>
          patchActive(s, (snap) => ({
            ...snap,
            incomes: snap.incomes.map((i) => (i.id === id ? { ...i, ...patch } : i)),
          })),
        ),
      removeIncome: (id) =>
        set((s) =>
          patchActive(s, (snap) => ({
            ...snap,
            incomes: snap.incomes.filter((i) => i.id !== id),
          })),
        ),

      // --- Активы ---
      addAsset: () =>
        set((s) =>
          patchActive(s, (snap) => ({
            ...snap,
            assets: [...snap.assets, { id: uid(), name: '', amount: 0 }],
          })),
        ),
      updateAsset: (id, patch) =>
        set((s) =>
          patchActive(s, (snap) => ({
            ...snap,
            assets: snap.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
          })),
        ),
      removeAsset: (id) =>
        set((s) =>
          patchActive(s, (snap) => ({
            ...snap,
            assets: snap.assets.filter((a) => a.id !== id),
          })),
        ),

      // --- Периоды ---
      setActiveMonth: (month) =>
        set((s) => (s.months.some((m) => m.month === month) ? { activeMonth: month } : {})),

      addMonth: () =>
        set((s) => {
          const sorted = [...s.months].sort((a, b) => compareMonthAsc(a.month, b.month))
          const latest = sorted[sorted.length - 1]
          let key = nextMonth(latest.month)
          while (s.months.some((m) => m.month === key)) key = nextMonth(key)
          const created = cloneSnapshot(latest, key)
          return { months: [...s.months, created], activeMonth: key }
        }),

      removeMonth: (month) =>
        set((s) => {
          if (s.months.length <= 1) return {}
          const months = s.months.filter((m) => m.month !== month)
          const activeMonth =
            s.activeMonth === month
              ? [...months].sort((a, b) => compareMonthAsc(a.month, b.month)).slice(-1)[0].month
              : s.activeMonth
          return { months, activeMonth }
        }),

      setMonthNote: (note) =>
        set((s) => patchActive(s, (snap) => ({ ...snap, note: note || undefined }))),

      // --- Данные целиком ---
      importData: (data) =>
        set({ user: data.user, activeMonth: data.activeMonth, months: data.months }),
      resetToSample: () => set(createSampleData()),
      clearAll: () =>
        set((s) =>
          patchActive(s, (snap) => ({ ...snap, expenses: [], incomes: [], assets: [] })),
        ),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => financeStorage),
      partialize: (s) => ({ user: s.user, activeMonth: s.activeMonth, months: s.months }),
      merge: (persisted, current) => ({
        ...current,
        ...(normalizePersisted(persisted) ?? createEmptyData()),
      }),
    },
  ),
)

const selectState = (s: FinanceStore): FinanceState => {
  const snap = findActive(s)
  return {
    user: s.user,
    expenses: snap.expenses,
    incomes: snap.incomes,
    assets: snap.assets,
  }
}

const selectData = (s: FinanceStore): FinanceData => ({
  user: s.user,
  activeMonth: s.activeMonth,
  months: s.months,
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
  setActiveMonth: s.setActiveMonth,
  addMonth: s.addMonth,
  removeMonth: s.removeMonth,
  setMonthNote: s.setMonthNote,
  importData: s.importData,
  resetToSample: s.resetToSample,
  clearAll: s.clearAll,
})

export function useFinanceState(): FinanceState {
  return useFinanceStore(useShallow(selectState))
}

export function useFinanceData(): FinanceData {
  return useFinanceStore(useShallow(selectData))
}

export function useFinanceActions(): FinanceActions {
  return useFinanceStore(useShallow(selectActions))
}

export function useFinanceSummary(): Summary {
  return useFinanceStore(useShallow((s) => computeSummary(selectState(s))))
}

export function useActiveNote(): string {
  return useFinanceStore((s) => findActive(s).note ?? '')
}

export function useFinanceHealth(): HealthReport {
  const state = useFinanceState()
  const summary = useFinanceSummary()
  // computeHealth возвращает объект с вложенными массивами — мемоизируем,
  // чтобы не отдавать новую ссылку на каждый рендер (иначе бесконечный цикл).
  return useMemo(() => computeHealth(state, summary), [state, summary])
}

export function useFinanceHistory(): HistoryReport {
  const data = useFinanceData()
  // Аналогично: серия и инсайты — новые массивы, нужна мемоизация.
  return useMemo(() => computeHistory(data), [data])
}

export type { ExpenseType }
