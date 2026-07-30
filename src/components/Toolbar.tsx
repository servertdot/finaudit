import { useRef, useState } from 'react'
import type { FinanceData } from '../types'
import type { Theme } from '../lib/theme'
import { exportJson, exportPng, readImportFile } from '../lib/exporter'
import { ThemeToggle } from './ThemeToggle'

interface ToolbarProps {
  data: FinanceData
  captureRef: React.RefObject<HTMLDivElement | null>
  theme: Theme
  onToggleTheme: () => void
  onImport: (data: FinanceData) => void
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
    default: 'toolbar-button-default',
    primary: 'toolbar-button-primary',
    danger: 'toolbar-button-danger',
  }[variant]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`toolbar-button shrink-0 disabled:cursor-not-allowed disabled:opacity-45 ${styles}`}
    >
      {children}
    </button>
  )
}

export function Toolbar({
  data,
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
    <div className="action-bar material-bar flex items-center gap-1">
      <ToolbarButton variant="primary" onClick={() => exportJson(data)}>
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
      <div className="mx-1 h-5 w-px shrink-0 bg-line" />
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
          className={`ml-1 shrink-0 text-[12px] ${
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
