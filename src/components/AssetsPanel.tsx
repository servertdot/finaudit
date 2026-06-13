import type { AssetItem, AssetType } from '../types'
import {
  ASSET_TYPES,
  ASSET_TYPE_LABELS,
  annualIncome,
  defaultLiquidFor,
  hasYield,
  monthlyIncome,
} from '../lib/assets'
import { formatMoney } from '../lib/format'
import { MoneyInput } from './MoneyInput'
import { Panel } from './Panel'
import { TrashIcon, WalletIcon } from './icons'

interface AssetsPanelProps {
  items: AssetItem[]
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<Omit<AssetItem, 'id'>>) => void
  onRemove: (id: string) => void
}

export function AssetsPanel({ items, onAdd, onUpdate, onRemove }: AssetsPanelProps) {
  const totalMonthly = items.reduce((acc, item) => acc + monthlyIncome(item), 0)
  const totalAnnual = items.reduce((acc, item) => acc + annualIncome(item), 0)

  return (
    <Panel
      title="Активы"
      accent="slate"
      icon={<WalletIcon size={18} className="text-ink-soft" />}
      onAdd={onAdd}
      addTitle="Добавить актив"
    >
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          Пусто. Нажмите «+», чтобы добавить.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                <th className="pb-2.5 font-medium">Актив</th>
                <th className="pb-2.5 pl-2 font-medium">Вид</th>
                <th className="pb-2.5 pl-2 text-right font-medium">% год.</th>
                <th
                  className="pb-2.5 pl-2 text-center font-medium"
                  title="Учитывать в финансовой подушке"
                >
                  В&nbsp;подушку
                </th>
                <th className="pb-2.5 pl-2 text-right font-medium">Сумма</th>
                <th className="pb-2.5" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const yielding = hasYield(item.type)
                const perMonth = monthlyIncome(item)
                return (
                  <tr key={item.id} className="border-t border-line align-top">
                    <td className="py-1.5 pr-2">
                      <input
                        value={item.name}
                        placeholder="Название"
                        onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                        className="w-full rounded-md border border-transparent px-1.5 py-1.5 text-sm text-ink outline-none transition-colors hover:border-line focus:border-ink"
                      />
                    </td>
                    <td className="py-1.5 pl-2">
                      <select
                        value={item.type}
                        onChange={(e) => {
                          const type = e.target.value as AssetType
                          onUpdate(item.id, {
                            type,
                            liquid: defaultLiquidFor(type),
                            // Ставка имеет смысл только для доходных активов.
                            rate: hasYield(type) ? item.rate : undefined,
                          })
                        }}
                        className="cursor-pointer rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink-soft outline-none transition-colors hover:border-line-strong focus:border-ink"
                      >
                        {ASSET_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {ASSET_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="w-24 py-1.5 pl-2 text-right">
                      {yielding ? (
                        <>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step={0.1}
                            value={item.rate ?? ''}
                            placeholder="0"
                            onChange={(e) =>
                              onUpdate(item.id, {
                                rate: e.target.value === '' ? undefined : Number(e.target.value),
                              })
                            }
                            aria-label="Ставка % годовых"
                            className="w-full rounded-md border border-line bg-paper/40 px-2.5 py-1.5 text-right text-sm tabular-nums text-ink outline-none transition-colors hover:border-line-strong focus:border-ink focus:bg-surface"
                          />
                          {perMonth > 0 && (
                            <span className="mt-1 block text-[11px] tabular-nums text-pos">
                              +{formatMoney(perMonth)}/мес
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="block py-1.5 pr-2.5 text-sm text-muted">—</span>
                      )}
                    </td>
                    <td className="py-1.5 pl-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.liquid}
                        onChange={(e) => onUpdate(item.id, { liquid: e.target.checked })}
                        title="Учитывать в финансовой подушке"
                        aria-label="Учитывать в финансовой подушке"
                        className="mt-2 h-4 w-4 cursor-pointer accent-ink"
                      />
                    </td>
                    <td className="w-24 py-1.5 pl-2">
                      <MoneyInput
                        value={item.amount}
                        onChange={(amount) => onUpdate(item.id, { amount })}
                      />
                    </td>
                    <td className="py-1.5 pl-1">
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        title="Удалить"
                        aria-label="Удалить"
                        className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-neg-soft hover:text-neg"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {totalAnnual > 0 && (
            <div className="mt-3 flex items-center justify-between rounded-md bg-pos-soft px-3 py-2 text-sm">
              <span className="text-ink-soft">Ожидаемый доход с %</span>
              <span className="tabular-nums font-medium text-pos">
                +{formatMoney(totalMonthly)}/мес · +{formatMoney(totalAnnual)}/год
              </span>
            </div>
          )}

          <p className="mt-3 text-[12px] leading-snug text-muted">
            «В&nbsp;подушку» — ликвидные активы, доступные сразу. Для вклада и инвестиций укажите
            ставку «% годовых» — при создании нового месяца сумма автоматически вырастет на доход
            за&nbsp;месяц.
          </p>
        </div>
      )}
    </Panel>
  )
}
