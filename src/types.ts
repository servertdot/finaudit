export type ExpenseType = 'FC' | 'VC'

export interface ExpenseItem {
  id: string
  name: string
  type: ExpenseType
  amount: number
}

export interface IncomeItem {
  id: string
  name: string
  amount: number
}

export interface AssetItem {
  id: string
  name: string
  amount: number
}

export interface FinanceState {
  user: string
  expenses: ExpenseItem[]
  incomes: IncomeItem[]
  assets: AssetItem[]
}

/** Снимок финансов за один месяц. Ключ месяца — строка вида "2026-06". */
export interface MonthlySnapshot {
  month: string
  note?: string
  expenses: ExpenseItem[]
  incomes: IncomeItem[]
  assets: AssetItem[]
}

/** Полное состояние приложения: пользователь + история помесячных снимков. */
export interface FinanceData {
  user: string
  activeMonth: string
  months: MonthlySnapshot[]
}

export interface Summary {
  income: number
  expenses: number
  net: number
  variable: number
  fixed: number
  variableShare: number
  fixedShare: number
  freeBalance: number
}
