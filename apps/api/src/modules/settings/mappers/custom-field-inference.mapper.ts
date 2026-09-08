import { normalizeText } from '@repo/shared-utils'
import type { CustomFieldHeaderSuggestion, CustomFieldType, FieldDef } from '@repo/shared-types'
import type { ColumnAnalysis } from '@/shared/imports/interfaces/import.interfaces'

const BOOLEAN_VALUES = new Set(['true', 'false', 'si', 'no', 'yes'])
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_PATTERN = /^https?:\/\/\S+$/i
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(T.*)?$/
const LOCAL_DATE_PATTERN = /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/
const NUMBER_PATTERN = /^-?\d+(?:[.,]\d+)?$/
const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/
const KEY_MAX_LENGTH = 40

function isPhoneLike(value: string): boolean {
  if (!PHONE_PATTERN.test(value)) return false
  const digits = value.replaceAll(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return false
  return (
    value.startsWith('+') ||
    /[\s().-]/.test(value) ||
    (digits.length === 10 && digits.startsWith('3'))
  )
}

export function inferFieldType(sampleValues: string[]): CustomFieldType {
  const values = sampleValues.map((value) => value.trim()).filter(Boolean)
  if (values.length === 0) return 'text'

  const every = (predicate: (value: string) => boolean) => values.every(predicate)

  if (every((value) => BOOLEAN_VALUES.has(normalizeText(value)))) return 'boolean'
  if (every((value) => EMAIL_PATTERN.test(value))) return 'email'
  if (every((value) => URL_PATTERN.test(value))) return 'url'
  if (every((value) => ISO_DATE_PATTERN.test(value) || LOCAL_DATE_PATTERN.test(value))) {
    return 'date'
  }
  if (every(isPhoneLike)) return 'phone'
  if (every((value) => NUMBER_PATTERN.test(value))) return 'number'
  return 'text'
}

export function suggestFieldKey(column: string, takenKeys: Set<string>): string {
  const slug = normalizeText(column)
    .replaceAll(/[^a-z0-9]+/g, '_')
    .replaceAll(/^_+|_+$/g, '')
    .slice(0, KEY_MAX_LENGTH)
  const base = /^[a-z]/.test(slug) ? slug : `campo${slug ? `_${slug}` : ''}`

  if (!takenKeys.has(base)) return base
  for (let suffix = 2; ; suffix += 1) {
    const candidate = `${base.slice(0, KEY_MAX_LENGTH - String(suffix).length - 1)}_${suffix}`
    if (!takenKeys.has(candidate)) return candidate
  }
}

export function buildHeaderSuggestions(
  columns: ColumnAnalysis[],
  existingDefs: FieldDef[],
): CustomFieldHeaderSuggestion[] {
  const existingKeys = new Set(existingDefs.map((def) => def.key))
  const existingLabels = new Map(
    existingDefs.map((def) => [normalizeText(def.label), def.key] as const),
  )
  const takenKeys = new Set(existingKeys)

  return columns.map((column) => {
    const label = column.csvColumn.trim()
    const baseKey = suggestFieldKey(label, new Set())
    const existingFieldKey =
      (existingKeys.has(baseKey) ? baseKey : null) ??
      existingLabels.get(normalizeText(label)) ??
      null
    const suggestedKey = suggestFieldKey(label, takenKeys)
    takenKeys.add(suggestedKey)

    return {
      column: column.csvColumn,
      sampleValues: column.sampleValues,
      fillRate: column.fillRate,
      suggestedKey,
      suggestedLabel: label,
      suggestedType: inferFieldType(column.sampleValues),
      existingFieldKey,
    }
  })
}
