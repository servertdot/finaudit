import { Copy, Download, Upload } from 'lucide-react'
import { forwardRef, useRef, useState } from 'react'
import type { FinanceData } from '../types'
import type { Theme } from '../lib/theme'
import {
  copyJson,
  exportJson,
  exportPng,
  parseImportJson,
  readImportFile,
} from '../lib/exporter'
import { ThemeToggle } from './ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'

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

const ToolbarButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'primary' | 'danger'
  }
>(function ToolbarButton(
  {
    onClick,
    children,
    variant = 'default',
    disabled,
    className,
    ...props
  },
  ref,
) {
  const styles = {
    default: 'toolbar-button-default',
    primary: 'toolbar-button-primary',
    danger: 'toolbar-button-danger',
  }[variant]
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`toolbar-button shrink-0 disabled:cursor-not-allowed disabled:opacity-45 ${styles} ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  )
})

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
  const jsonRef = useRef<HTMLTextAreaElement>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [importOpen, setImportOpen] = useState(false)
  const [importMode, setImportMode] = useState<'file' | 'json'>('file')
  const [jsonValue, setJsonValue] = useState('')


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

  const handleCopyJson = async () => {
    try {
      await copyJson(data)
      setStatus({ kind: 'ok', message: 'JSON скопирован' })
    } catch (err) {
      setStatus({ kind: 'error', message: 'Не удалось скопировать JSON' })
      console.error(err)
    }
  }

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const imported = await readImportFile(file)
      onImport(imported)
      setImportOpen(false)
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

  const handleImportJson = () => {
    try {
      const imported = parseImportJson(jsonValue)
      onImport(imported)
      setImportOpen(false)
      setJsonValue('')
      setStatus({ kind: 'ok', message: 'Данные импортированы' })
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Ошибка импорта',
      })
      jsonRef.current?.focus()
    }
  }

  return (
    <div className="action-bar material-bar flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Экспорт JSON"
            className="toolbar-icon-button data-[state=open]:transform-none active:transform-none"
          >
            <Download className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="dropdown-menu-content min-w-48">
          <DropdownMenuItem onSelect={() => exportJson(data)}>
            <Download className="size-4" />
            Скачать JSON-файл
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleCopyJson}>
            <Copy className="size-4" />
            Скопировать JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu open={importOpen} onOpenChange={setImportOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Импорт JSON"
            className="toolbar-icon-button data-[state=open]:transform-none active:transform-none"
          >
            <Upload className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="dropdown-menu-content w-[min(34rem,calc(100vw-2rem))] p-3"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div className="mb-3">
            <p className="eyebrow">Импорт данных</p>
            <p className="font-display text-lg font-semibold text-ink">Выберите способ</p>
          </div>
          <div className="flex gap-2 border-b border-line" role="tablist">
            {([
              ['file', 'Из файла'],
              ['json', 'Вставить JSON'],
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={importMode === mode}
                className={`border-b-2 px-2 pb-2 text-sm font-medium ${
                  importMode === mode
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-ink'
                }`}
                onClick={() => {
                  setImportMode(mode)
                  setStatus({ kind: 'idle' })
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {importMode === 'file' ? (
            <div className="py-5 text-center">
              <p className="mb-3 text-sm text-ink-soft">Загрузите ранее экспортированный JSON-файл.</p>
              <ToolbarButton variant="primary" onClick={() => fileRef.current?.click()}>
                Выбрать файл
              </ToolbarButton>
            </div>
          ) : (
            <div className="pt-4">
              <label htmlFor="import-json" className="mb-2 block text-sm font-medium text-ink">
                JSON
              </label>
              <textarea
                ref={jsonRef}
                id="import-json"
                value={jsonValue}
                onChange={(event) => {
                  setJsonValue(event.target.value)
                  if (status.kind === 'error') setStatus({ kind: 'idle' })
                }}
                placeholder='{ "user": "...", "months": [...] }'
                spellCheck={false}
                className="field min-h-44 w-full resize-y font-mono text-xs"
              />
              <p className="mt-2 text-xs text-muted">Данные проверяются перед импортом.</p>
              {status.kind === 'error' && (
                <p className="mt-2 text-xs text-neg" role="alert">{status.message}</p>
              )}
              <div className="modal-footer mt-4">
                <button
                  type="button"
                  className="modal-button modal-button-secondary"
                  onClick={() => setImportOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className="modal-button modal-button-primary"
                  onClick={handleImportJson}
                  disabled={!jsonValue.trim()}
                >
                  Проверить и импортировать
                </button>
              </div>
            </div>
          )}
          {importMode === 'file' && status.kind === 'error' && (
            <p className="pb-2 text-xs text-neg" role="alert">{status.message}</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
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
