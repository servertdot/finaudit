const MONTHS_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

const MONTHS_RU_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
]

const MONTH_KEY_RE = /^\d{4}-\d{2}$/

export function isMonthKey(value: unknown): value is string {
  return typeof value === 'string' && MONTH_KEY_RE.test(value)
}

export function currentMonthKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** Разбирает "2026-06" → { year: 2026, month: 6 } (month 1..12). */
export function parseMonth(key: string): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m }
}

/** "2026-06" → "Июнь 2026". */
export function formatMonth(key: string): string {
  if (!isMonthKey(key)) return key
  const { year, month } = parseMonth(key)
  return `${MONTHS_RU[month - 1]} ${year}`
}

/** "2026-06" → "июн '26" (для осей графиков). */
export function formatMonthShort(key: string): string {
  if (!isMonthKey(key)) return key
  const { year, month } = parseMonth(key)
  return `${MONTHS_RU_SHORT[month - 1]} '${String(year).slice(2)}`
}

function shift(key: string, delta: number): string {
  const { year, month } = parseMonth(key)
  const total = year * 12 + (month - 1) + delta
  const y = Math.floor(total / 12)
  const m = (total % 12) + 1
  return `${y}-${String(m).padStart(2, '0')}`
}

export function nextMonth(key: string): string {
  return shift(key, 1)
}

export function prevMonth(key: string): string {
  return shift(key, -1)
}

/** Сравнение по возрастанию (для сортировки массива месяцев). */
export function compareMonthAsc(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** Сколько календарных месяцев между ключами (b - a). */
export function monthsBetween(a: string, b: string): number {
  const pa = parseMonth(a)
  const pb = parseMonth(b)
  return pb.year * 12 + pb.month - (pa.year * 12 + pa.month)
}
