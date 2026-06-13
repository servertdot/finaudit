import type { ReactNode } from 'react'
import { MoneyInput } from './MoneyInput'
import { Panel } from './Panel'
import { TrashIcon } from './icons'

interface SimpleItem {
  id: string
  name: string
  amount: number
}

interface SimpleListPanelProps {
  title: string
  icon?: ReactNode
  accent?: 'indigo' | 'rose' | 'emerald' | 'slate'
  items: SimpleItem[]
  showHeader?: boolean
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<Omit<SimpleItem, 'id'>>) => void
  onRemove: (id: string) => void
  addTitle?: string
}

export function SimpleListPanel({
  title,
  icon,
  accent = 'slate',
  items,
  showHeader = false,
  onAdd,
  onUpdate,
  onRemove,
  addTitle = 'Добавить',
}: SimpleListPanelProps) {
  return (
    <Panel title={title} icon={icon} accent={accent} onAdd={onAdd} addTitle={addTitle}>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          Пусто. Нажмите «+», чтобы добавить.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {showHeader && (
            <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              <span className="flex-1">Категория</span>
              <span className="w-28 text-right">Сумма</span>
              <span className="w-8" />
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <input
                value={item.name}
                placeholder="Название"
                onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                className="flex-1 rounded-md border border-transparent px-1.5 py-1.5 text-sm text-ink outline-none transition-colors hover:border-line focus:border-ink"
              />
              <div className="w-28">
                <MoneyInput
                  value={item.amount}
                  onChange={(amount) => onUpdate(item.id, { amount })}
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                title="Удалить"
                aria-label="Удалить"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-neg-soft hover:text-neg"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}
