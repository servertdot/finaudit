import { useRef, useState } from 'react'
import type { FinanceState } from '../types'
import type { Theme } from '../lib/theme'
import { exportJson, exportPng, readImportFile } from '../lib/exporter'
import { ThemeToggle } from './ThemeToggle'

interface ToolbarProps {
  state: FinanceState
  captureRef: React.RefObject<HTMLDivElement | null>
  theme: Theme
  onToggleTheme: () => void
  onImport: (state: FinanceState) => void
  onResetSample: () => void
  onClear: () => void
}

type Status = { kind: 'idle' | 'busy' | 'ok' | 'error'; message?: string }

function ToolbarButton({
  onClick,
  children,
  variant = 'default',
  disabled,
}: {
  onClick: () => void
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'danger'
  disabled?: boolean
}) {
  const styles = {
    default:
      'border-line-strong bg-surface text-ink-soft hover:border-ink hover:text-ink',
    primary: 'border-accent bg-accent text-paper hover:opacity-90',
    danger:
      'border-line-strong bg-surface text-neg hover:border-neg hover:bg-neg-soft',
  }[variant]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-4 py-1.5 text-[13px] font-medium tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  )
}

export function Toolbar({
  state,
  captureRef,
  theme,
  onToggleTheme,
  onImport,
  onResetSample,
  onClear,
}: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const handleExportPng = async () => {
    if (!captureRef.current) return
    setStatus({ kind: 'busy', message: 'Готовлю изображение…' })
    try {
      await exportPng(captureRef.current)
      setStatus({ kind: 'ok', message: 'Картинка сохранена' })
    } catch (err) {
      setStatus({ kind: 'error', message: 'Не удалось создать изображение' })
      console.error(err)
    }
  }

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const imported = await readImportFile(file)
      onImport(imported)
      setStatus({ kind: 'ok', message: 'Данные импортированы' })
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Ошибка импорта',
      })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToolbarButton variant="primary" onClick={() => exportJson(state)}>
        Экспорт JSON
      </ToolbarButton>
      <ToolbarButton onClick={() => fileRef.current?.click()}>
        Импорт JSON
      </ToolbarButton>
      <ToolbarButton
        onClick={handleExportPng}
        disabled={status.kind === 'busy'}
      >
        Скачать картинку (PNG)
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-line-strong" />
      <ToolbarButton onClick={onResetSample}>Демо-данные</ToolbarButton>
      <ToolbarButton variant="danger" onClick={onClear}>
        Очистить
      </ToolbarButton>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => handleImportFile(e.target.files?.[0])}
      />

      {status.message && (
        <span
          className={`ml-1 text-[13px] ${
            status.kind === 'error'
              ? 'text-neg'
              : status.kind === 'ok'
                ? 'text-pos'
                : 'text-muted'
          }`}
        >
          {status.message}
        </span>
      )}

      <ThemeToggle theme={theme} onToggle={onToggleTheme} className="ml-auto" />
    </div>
  )
}
