import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { AssetItem, AssetType, ExpenseItem, ExpenseType, IncomeItem } from '../types'
import {
  ASSET_TYPES,
  ASSET_TYPE_LABELS,
  defaultLiquidFor,
  hasYield,
} from '../lib/assets'
import { MoneyInput } from './MoneyInput'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { Button } from './ui/button'

interface ModalShellProps {
  open: boolean
  title: string
  description: string
  submitLabel: string
  submitDisabled?: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
}

function CloseIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function ModalShell({
  open,
  title,
  description,
  submitLabel,
  submitDisabled = false,
  onClose,
  onSubmit,
  children,
}: ModalShellProps) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="modal-layer"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal-backdrop" aria-hidden />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="modal-sheet"
      >
        <div className="modal-grabber" aria-hidden />
        <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl font-semibold tracking-[-0.025em] text-ink">
              {title}
            </h2>
            <p id={descriptionId} className="mt-1 text-[13px] leading-relaxed text-muted">
              {description}
            </p>
          </div>
          <Button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            variant="ghost"
            size="icon"
            className="modal-close"
          >
            <CloseIcon />
          </Button>
        </header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="modal-content flex flex-col gap-4 px-5 py-1 sm:px-6">{children}</div>
          <footer className="modal-footer mt-5 flex items-center justify-end gap-2 px-5 py-4 sm:px-6">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              className="modal-button modal-button-secondary"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={submitDisabled}
              className="modal-button modal-button-primary"
            >
              {submitLabel}
            </Button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  )
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink-soft">{label}</span>
      {children}
      {hint && <span className="text-[11px] leading-relaxed text-muted">{hint}</span>}
    </label>
  )
}

interface AddExpenseModalProps {
  open: boolean
  onClose: () => void
  onAdd: (item: Omit<ExpenseItem, 'id'>) => void
}

export function AddExpenseModal({ open, onClose, onAdd }: AddExpenseModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<ExpenseType>('FC')
  const [amount, setAmount] = useState(0)

  const handleClose = () => {
    setName('')
    setType('FC')
    setAmount(0)
    onClose()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    onAdd({ name: trimmedName, type, amount })
    handleClose()
  }

  return (
    <ModalShell
      open={open}
      title="Новый расход"
      description="Заполните основные данные — запись сразу появится в таблице."
      submitLabel="Добавить расход"
      submitDisabled={!name.trim()}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <FormField label="Категория">
        <Input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Например, жильё"
          className="min-h-11 px-3 text-[15px]"
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Тип расхода">
          <Select
            value={type}
            onChange={(event) => setType(event.target.value as ExpenseType)}
            className="min-h-11 px-3 text-[15px]"
          >
            <option value="FC">Постоянный (FC)</option>
            <option value="VC">Переменный (VC)</option>
          </Select>
        </FormField>
        <FormField label="Сумма">
          <MoneyInput value={amount} onChange={setAmount} align="left" />
        </FormField>
      </div>
    </ModalShell>
  )
}

interface AddIncomeModalProps {
  open: boolean
  onClose: () => void
  onAdd: (item: Omit<IncomeItem, 'id'>) => void
}

export function AddIncomeModal({ open, onClose, onAdd }: AddIncomeModalProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)

  const handleClose = () => {
    setName('')
    setAmount(0)
    onClose()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    onAdd({ name: trimmedName, amount })
    handleClose()
  }

  return (
    <ModalShell
      open={open}
      title="Новый доход"
      description="Укажите источник и сумму дохода за выбранный месяц."
      submitLabel="Добавить доход"
      submitDisabled={!name.trim()}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <FormField label="Источник дохода">
        <Input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Например, зарплата"
          className="min-h-11 px-3 text-[15px]"
        />
      </FormField>
      <FormField label="Сумма">
        <MoneyInput value={amount} onChange={setAmount} align="left" />
      </FormField>
    </ModalShell>
  )
}

interface AddAssetModalProps {
  open: boolean
  onClose: () => void
  onAdd: (item: Omit<AssetItem, 'id'>) => void
}

export function AddAssetModal({ open, onClose, onAdd }: AddAssetModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<AssetType>('cash')
  const [amount, setAmount] = useState(0)
  const [rate, setRate] = useState('')
  const [liquid, setLiquid] = useState(true)
  const [note, setNote] = useState('')

  const handleClose = () => {
    setName('')
    setType('cash')
    setRate('')
    setLiquid(true)
    setNote('')
    onClose()
  }

  const handleTypeChange = (nextType: AssetType) => {
    setType(nextType)
    setLiquid(defaultLiquidFor(nextType))
    if (!hasYield(nextType)) setRate('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    onAdd({
      name: trimmedName,
      type,
      amount,
      liquid,
      note: note.trim() || undefined,
      rate: hasYield(type) && rate !== '' ? Number(rate) : undefined,
    })
    handleClose()
  }

  return (
    <ModalShell
      open={open}
      title="Новый актив"
      description="Добавьте актив целиком — без пустой строки и последующего редактирования по колонкам."
      submitLabel="Добавить актив"
      submitDisabled={!name.trim()}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <FormField label="Название">
        <Input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Например, накопительный счёт"
          className="min-h-11 px-3 text-[15px]"
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Вид актива">
          <Select
            value={type}
            onChange={(event) => handleTypeChange(event.target.value as AssetType)}
            className="min-h-11 px-3 text-[15px]"
          >
            {ASSET_TYPES.map((assetType) => (
              <option key={assetType} value={assetType}>
                {ASSET_TYPE_LABELS[assetType]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Сумма">
          <MoneyInput value={amount} onChange={setAmount} align="left" />
        </FormField>
      </div>

      {hasYield(type) && (
        <FormField label="Ставка, % годовых" hint="Используется для расчёта ожидаемого дохода.">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            placeholder="0"
            className="min-h-11 px-3 text-[15px] tabular-nums"
          />
        </FormField>
      )}

      <FormField label="Примечание">
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Например, цель или срок"
          rows={3}
          className="field w-full resize-y px-3 py-2 text-[15px] leading-relaxed text-ink"
        />
      </FormField>

      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-paper px-3.5 py-3">
        <span>
          <span className="block text-[14px] font-medium text-ink">Учитывать в подушке</span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
            Актив можно быстро использовать без существенных потерь.
          </span>
        </span>
        <Checkbox
          checked={liquid}
          onChange={(event) => setLiquid(event.target.checked)}
          className="size-5"
        />
      </label>
    </ModalShell>
  )
}
