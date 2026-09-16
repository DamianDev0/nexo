import { CENTAVOS_PER_PESO } from '@repo/shared-utils'

const NUMERIC_TYPES = new Set(['number', 'currency'])

export function isCurrencyField(fieldType: string | undefined): boolean {
  return fieldType === 'currency'
}

export function isNumericField(fieldType: string | undefined): boolean {
  return fieldType !== undefined && NUMERIC_TYPES.has(fieldType)
}

export function customFieldToInput(value: unknown, fieldType: string | undefined): string {
  if (value === undefined || value === null) return ''
  if (isCurrencyField(fieldType) && typeof value === 'number') {
    return String(value / CENTAVOS_PER_PESO)
  }
  return String(value)
}

export function customFieldFromInput(
  raw: string,
  fieldType: string | undefined,
): string | number | null {
  if (raw === '') return null
  if (!isNumericField(fieldType)) return raw
  const amount = Number(raw)
  if (!Number.isFinite(amount)) return null
  return isCurrencyField(fieldType) ? Math.round(amount * CENTAVOS_PER_PESO) : amount
}
