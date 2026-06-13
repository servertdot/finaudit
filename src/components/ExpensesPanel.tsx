import type { ExpenseItem, ExpenseType } from '../types'
import { MoneyInput } from './MoneyInput'
import { Panel } from './Panel'
import { TrashIcon, TrendDownIcon } from './icons'

interface ExpensesPanelProps {
  items: ExpenseItem[]
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<Omit<ExpenseItem, 'id'>>) => void
  onRemove: (id: string) => void
}

export function ExpensesPanel({ items, onAdd, onUpdate, onRemove }: ExpensesPanelProps) {
  return (
    <Panel
      title="Расходы по категориям"
      accent="rose"
      icon={<TrendDownIcon className="text-rose-500" />}
      onAdd={onAdd}
      addTitle="Добавить расход"
    >
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          Нет категорий. Нажмите «+», чтобы добавить.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                <th className="pb-2.5 font-medium">Категория</th>
                <th className="pb-2.5 pl-2 font-medium">Тип</th>
                <th className="pb-2.5 pl-2 text-right font-medium">Сумма</th>
                <th className="pb-2.5" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <td className="py-1.5 pr-2">
                    <input
                      value={item.name}
                      placeholder="Категория"
                      onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                      className="w-full rounded-md border border-transparent px-1.5 py-1.5 text-sm text-ink outline-none transition-colors hover:border-line focus:border-ink"
                    />
                  </td>
                  <td className="py-1.5 pl-2">
                    <select
                      value={item.type}
                      onChange={(e) =>
                        onUpdate(item.id, { type: e.target.value as ExpenseType })
                      }
                      className="cursor-pointer rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink-soft outline-none transition-colors hover:border-line-strong focus:border-ink"
                    >
                      <option value="FC">FC (Пост.)</option>
                      <option value="VC">VC (Перем.)</option>
                    </select>
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
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-neg-soft hover:text-neg"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}
