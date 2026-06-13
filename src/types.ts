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
