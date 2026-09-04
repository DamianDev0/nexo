import { CENTAVOS_PER_PESO } from '@repo/shared-utils'

export function toggleListItem(current: unknown, item: string): string[] {
  const list = Array.isArray(current) ? (current as string[]) : []
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]
}

export function splitDateTimeValue(value: unknown): { date: string; time: string } {
  const raw = typeof value === 'string' ? value : ''
  return { date: raw.slice(0, 10), time: raw.slice(11, 16) }
}

export function joinDateTime(date: string, time: string): string {
  return `${date}T${time || '00:00'}`
}

export function formatCustomFieldValue(value: unknown, isCurrency: boolean): string {
  if (value === undefined || value === null) return ''
  if (isCurrency && typeof value === 'number') return String(value / CENTAVOS_PER_PESO)
  return String(value)
}

export function parseCustomFieldNumber(raw: string, isCurrency: boolean): number | '' {
  if (raw === '') return ''
  return isCurrency ? Math.round(Number(raw) * CENTAVOS_PER_PESO) : Number(raw)
}
