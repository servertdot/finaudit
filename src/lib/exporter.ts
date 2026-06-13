import { toPng } from 'html-to-image'
import type { FinanceState } from '../types'
import { normalizeState } from './storage'

function triggerDownload(href: string, filename: string) {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10)
}

export function exportJson(state: FinanceState): void {
  const payload = JSON.stringify(state, null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, `finaudit-${dateStamp()}.json`)
  URL.revokeObjectURL(url)
}

function currentPaperColor(): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-paper')
    .trim()
  return value || '#f4f3ef'
}

export async function exportPng(node: HTMLElement): Promise<void> {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: currentPaperColor(),
    cacheBust: true,
  })
  triggerDownload(dataUrl, `finaudit-${dateStamp()}.png`)
}

export function readImportFile(file: File): Promise<FinanceState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        const state = normalizeState(parsed)
        if (!state) {
          reject(new Error('Файл не содержит корректных данных'))
          return
        }
        resolve(state)
      } catch {
        reject(new Error('Не удалось прочитать JSON-файл'))
      }
    }
    reader.onerror = () => reject(new Error('Ошибка чтения файла'))
    reader.readAsText(file)
  })
}
