import type { AssetType, FinanceData, MonthlySnapshot } from '../types'
import { defaultLiquidFor } from './assets'
import { uid } from './id'
import { currentMonthKey, prevMonth } from './period'

interface MonthShape {
  expenses: { name: string; type: 'FC' | 'VC'; amount: number }[]
  incomes: { name: string; amount: number }[]
  assets: { name: string; type: AssetType; amount: number; liquid?: boolean; rate?: number }[]
}

function buildSnapshot(month: string, shape: MonthShape): MonthlySnapshot {
  return {
    month,
    expenses: shape.expenses.map((e) => ({ id: uid(), ...e })),
    incomes: shape.incomes.map((i) => ({ id: uid(), ...i })),
    assets: shape.assets.map((a) => ({
      ...a,
      id: uid(),
      liquid: a.liquid ?? defaultLiquidFor(a.type),
    })),
  }
}

/** Снимок месяца с лёгкой вариацией — для правдоподобной демо-истории. */
function shapeFor(index: number): MonthShape {
  // index 0 — самый старый, чем больше — тем «свежее».
  const bump = index * 30
  const incomeBase = 4200 + index * 90
  const savings = 30000 + index * 1450
  return {
    expenses: [
      { name: 'Жилье', type: 'FC', amount: 690 },
      { name: 'Продукты', type: 'FC', amount: 480 + bump },
      { name: 'Транспорт', type: 'FC', amount: 26 },
      { name: 'Подписки', type: 'FC', amount: 20 },
      { name: 'Здоровье', type: 'FC', amount: 100 },
      { name: 'Кафе', type: 'VC', amount: 180 + bump },
      { name: 'Одежда', type: 'VC', amount: 35 + index * 8 },
      { name: 'Связь', type: 'VC', amount: 19 },
    ],
    incomes: [
      { name: 'Работа', amount: incomeBase },
      { name: 'Менторство', amount: index * 40 },
      { name: 'Проценты/дивиденды', amount: 12 + index * 3 },
      { name: 'Кэшбэк', amount: 16 },
    ],
    assets: [
      { name: 'Наличные', type: 'cash', amount: 2000 + index * 200 },
      { name: 'Счёт в банке', type: 'account', amount: 2000 + index * 500 },
      { name: 'Вклад под %', type: 'deposit', amount: savings, rate: 16 },
      { name: 'Инвестиции', type: 'investment', amount: 5000 + index * 1200, rate: 10 },
    ],
  }
}

export function createSampleData(): FinanceData {
  const now = currentMonthKey()
  // Шесть месяцев: от пяти месяцев назад до текущего.
  const keys: string[] = []
  let k = now
  for (let i = 0; i < 6; i++) {
    keys.unshift(k)
    k = prevMonth(k)
  }
  const months = keys.map((month, i) => buildSnapshot(month, shapeFor(i)))
  return { user: 'Андрей', activeMonth: now, months }
}

export function createEmptyData(): FinanceData {
  const month = currentMonthKey()
  return {
    user: 'Пользователь',
    activeMonth: month,
    months: [{ month, expenses: [], incomes: [], assets: [] }],
  }
}
