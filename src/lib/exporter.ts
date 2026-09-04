import { toPng } from 'html-to-image'
import type { FinanceData } from '../types'
import { normalizePersisted } from './storage'

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

function jsonPayload(data: FinanceData): string {
  return JSON.stringify(data, null, 2)
}

export function exportJson(data: FinanceData): void {
  const payload = jsonPayload(data)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, `finaudit-${dateStamp()}.json`)
  URL.revokeObjectURL(url)
}

export async function copyJson(data: FinanceData): Promise<void> {
  await navigator.clipboard.writeText(jsonPayload(data))
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

export function parseImportJson(value: string): FinanceData {
  try {
    const parsed: unknown = JSON.parse(value)
    const data = normalizePersisted(parsed)
    if (!data) {
      throw new Error('JSON не содержит корректных данных')
    }
    return data
  } catch (error) {
    if (error instanceof Error && error.message === 'JSON не содержит корректных данных') {
      throw error
    }
    throw new Error('Некорректный JSON', { cause: error })
  }
}

export function readImportFile(file: File): Promise<FinanceData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(parseImportJson(String(reader.result)))
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Ошибка чтения файла'))
    reader.readAsText(file)
  })
}
