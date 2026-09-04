const numberFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const percentFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const GROUP_SEPARATOR = ' '

/**
 * Преобразует пользовательский текст суммы в число.
 * Пробелы — разделители групп, запятая и точка — десятичные разделители.
 */
export function parseMoneyInput(value: string): number {
  const { sign, integer, fraction } = getMoneyParts(value)
  const number = Number(`${sign}${integer}.${fraction || '0'}`)
  return Number.isFinite(number) ? number : 0
}

function getMoneyParts(value: string): { sign: string; integer: string; fraction: string; hasDecimal: boolean } {
  const compact = value.replace(/\s/g, '')
  const sign = compact.startsWith('-') ? '-' : ''
  const unsigned = compact.replace(/^[+-]/, '').replace(/[^\d.,]/g, '')
  const separatorIndex = Math.max(unsigned.lastIndexOf(','), unsigned.lastIndexOf('.'))
  const hasDecimal = separatorIndex >= 0
  const integer = (hasDecimal ? unsigned.slice(0, separatorIndex) : unsigned).replace(/[.,]/g, '')
  const fraction = hasDecimal ? unsigned.slice(separatorIndex + 1).replace(/[.,]/g, '') : ''
  return { sign, integer: integer || '0', fraction, hasDecimal }
}

/** Форматирует черновик суммы во время ввода, не меняя числовую модель. */
export function formatMoneyInput(value: string): string {
  if (value === '' || value === '-') return value
  const { sign, integer, fraction, hasDecimal } = getMoneyParts(value)
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR)
  return `${sign}${grouped}${hasDecimal ? `,${fraction}` : ''}`
}

export function formatMoney(value: number): string {
  return numberFormatter.format(value || 0)
}

export function formatPercent(value: number): string {
  return `${percentFormatter.format(value || 0)}%`
}

