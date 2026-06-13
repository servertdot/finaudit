import type { FinanceState } from '../types'
import { uid } from './id'

export function createSampleData(): FinanceState {
  return {
    user: 'Андрей',
    expenses: [
      { id: uid(), name: 'Продукты', type: 'FC', amount: 515 },
      { id: uid(), name: 'Кафе', type: 'VC', amount: 207 },
      { id: uid(), name: 'Транспорт', type: 'FC', amount: 26 },
      { id: uid(), name: 'Жилье', type: 'FC', amount: 690 },
      { id: uid(), name: 'Связь', type: 'VC', amount: 19 },
      { id: uid(), name: 'Подписки', type: 'FC', amount: 20 },
      { id: uid(), name: 'Одежда', type: 'VC', amount: 35 },
      { id: uid(), name: 'Здоровье', type: 'FC', amount: 100 },
      { id: uid(), name: 'Подарки', type: 'FC', amount: 345 },
    ],
    incomes: [
      { id: uid(), name: 'Менторство', amount: 0 },
      { id: uid(), name: 'Проценты/дивиденды', amount: 0 },
      { id: uid(), name: 'РАботы', amount: 4412 },
      { id: uid(), name: 'Арендная плата/роялти', amount: 0 },
      { id: uid(), name: 'Кэшбэк', amount: 16 },
      { id: uid(), name: 'Бусти', amount: 0 },
    ],
    assets: [
      { id: uid(), name: 'Подушка', amount: 30217 },
      { id: uid(), name: 'Экстренный фонд', amount: 0 },
      { id: uid(), name: 'Инвестиции сейчас', amount: 0 },
      { id: uid(), name: 'Инвестировано за период', amount: 0 },
      { id: uid(), name: 'Вывод из инвестиций', amount: 0 },
    ],
  }
}

export function createEmptyData(): FinanceState {
  return {
    user: 'Пользователь',
    expenses: [],
    incomes: [],
    assets: [],
  }
}
