import type { FinanceState, Summary } from '../types'

const sum = (items: { amount: number }[]) =>
  items.reduce((acc, item) => acc + (Number.isFinite(item.amount) ? item.amount : 0), 0)

export function computeSummary(state: FinanceState): Summary {
  const income = sum(state.incomes)
  const expenses = sum(state.expenses)
  const variable = sum(state.expenses.filter((e) => e.type === 'VC'))
  const fixed = sum(state.expenses.filter((e) => e.type === 'FC'))
  const net = income - expenses

  return {
    income,
    expenses,
    net,
    variable,
    fixed,
    variableShare: expenses > 0 ? (variable / expenses) * 100 : 0,
    fixedShare: expenses > 0 ? (fixed / expenses) * 100 : 0,
    freeBalance: net,
  }
}
