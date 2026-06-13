import type { AssetType } from '../types'

/** Порядок видов активов в выпадающем списке. */
export const ASSET_TYPES: AssetType[] = ['cash', 'account', 'deposit', 'investment', 'other']

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  cash: 'Наличные',
  account: 'Счёт/карта',
  deposit: 'Вклад',
  investment: 'Инвестиции',
  other: 'Другое',
}

/**
 * Ликвидность по умолчанию — доступен ли актив сразу, без потерь и сроков.
 * Вклад под процент и инвестиции по умолчанию не считаем «подушкой»:
 * деньги заблокированы или подвержены просадке.
 */
export const ASSET_TYPE_LIQUID: Record<AssetType, boolean> = {
  cash: true,
  account: true,
  deposit: false,
  investment: false,
  other: true,
}

export function defaultLiquidFor(type: AssetType): boolean {
  return ASSET_TYPE_LIQUID[type]
}

/** Виды активов, для которых имеет смысл задавать ставку % годовых. */
export const ASSET_TYPE_HAS_YIELD: Record<AssetType, boolean> = {
  cash: false,
  account: false,
  deposit: true,
  investment: true,
  other: false,
}

export function hasYield(type: AssetType): boolean {
  return ASSET_TYPE_HAS_YIELD[type]
}

interface YieldingAsset {
  amount: number
  rate?: number
}

/** Доход за год по активу при ставке «% годовых». */
export function annualIncome(asset: YieldingAsset): number {
  if (!asset.rate || !Number.isFinite(asset.rate)) return 0
  const amount = Number.isFinite(asset.amount) ? asset.amount : 0
  return amount * (asset.rate / 100)
}

/** Доход за один месяц (годовая ставка делится на 12). */
export function monthlyIncome(asset: YieldingAsset): number {
  return annualIncome(asset) / 12
}

/** Округление денег до копеек, чтобы не копить длинные дробные хвосты. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

/** Сумма активов через месяц: тело + накопленный за месяц процент. */
export function grownNextMonth(asset: YieldingAsset): number {
  const amount = Number.isFinite(asset.amount) ? asset.amount : 0
  return roundMoney(amount + monthlyIncome(asset))
}

export function isAssetType(value: unknown): value is AssetType {
  return (
    value === 'cash' ||
    value === 'account' ||
    value === 'deposit' ||
    value === 'investment' ||
    value === 'other'
  )
}
