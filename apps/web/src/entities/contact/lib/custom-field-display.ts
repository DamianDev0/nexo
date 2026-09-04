import { formatCOP, formatDateShortCO } from '@repo/shared-utils'

import type { ContactColumnDef } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export type CustomFieldColumn = Pick<ContactColumnDef, 'fieldType' | 'fieldOptions'>

export type CustomFieldDisplay = {
  text: string | null
  numeric: boolean
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

function fallbackText(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value) ?? ''
}

function optionLabel(def: CustomFieldColumn, value: unknown): string {
  const raw = fallbackText(value)
  return def.fieldOptions?.find((option) => option.value === raw)?.label ?? raw
}

function dateText(value: unknown): string {
  const raw = fallbackText(value)
  if (DATE_ONLY.test(raw)) return formatDateShortCO(`${raw}T00:00:00-05:00`)
  return formatDateShortCO(raw)
}

export function customFieldLabel(def: ContactColumnDef, fieldKey: string): string {
  return def.label ?? fieldKey
}

export type CustomFieldBadge = {
  label: string
  color?: string
}

export function customFieldBadges(def: CustomFieldColumn, value: unknown): CustomFieldBadge[] {
  if (def.fieldType !== 'select' && def.fieldType !== 'multiselect') return []
  if (value === null || value === undefined || value === '') return []

  const items = Array.isArray(value) ? value : [value]
  return items.map((item) => {
    const raw = fallbackText(item)
    const option = def.fieldOptions?.find((candidate) => candidate.value === raw)
    return { label: option?.label ?? raw, color: option?.color }
  })
}

export function customFieldDisplay(
  def: CustomFieldColumn,
  value: unknown,
  t: TFunction,
): CustomFieldDisplay {
  if (value === null || value === undefined || value === '') return { text: null, numeric: false }

  switch (def.fieldType) {
    case 'currency':
      return { text: formatCOP(Number(value)), numeric: true }
    case 'number':
      return { text: fallbackText(value), numeric: true }
    case 'date':
    case 'datetime':
      return { text: dateText(value), numeric: true }
    case 'boolean':
      return { text: value === true ? t('common.yes') : t('common.no'), numeric: false }
    case 'select':
      return { text: optionLabel(def, value), numeric: false }
    case 'multiselect': {
      const items = Array.isArray(value) ? value : [value]
      return { text: items.map((item) => optionLabel(def, item)).join(', '), numeric: false }
    }
    default: {
      if (Array.isArray(value)) {
        return { text: value.map(fallbackText).join(', '), numeric: false }
      }
      return { text: fallbackText(value), numeric: false }
    }
  }
}
