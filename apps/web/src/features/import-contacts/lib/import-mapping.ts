import { IMPORT_UNMAPPED } from '../config/import-contacts.constants'

import type { ImportMapping } from '../model/types/import.types'
import type { ImportFieldDef, ValidationPreview } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export function fieldLabel(t: TFunction, field: ImportFieldDef): string {
  return t(`contacts.import.fields.${field.field}`, { defaultValue: field.label })
}

function mappedFields(mapping: ImportMapping): Set<string> {
  return new Set(Object.values(mapping).filter(Boolean) as string[])
}

export function fromFieldValue(value: string): string | null {
  return value === IMPORT_UNMAPPED ? null : value
}

export function applyMapping(mapping: ImportMapping, column: string, field: string): ImportMapping {
  const next: ImportMapping = { ...mapping, [column]: fromFieldValue(field) }
  if (field === IMPORT_UNMAPPED) return next

  for (const [other, mapped] of Object.entries(mapping)) {
    if (other !== column && mapped === field) next[other] = null
  }

  return next
}

export function missingRequiredFields(
  mapping: ImportMapping,
  fields: ReadonlyArray<ImportFieldDef>,
): ImportFieldDef[] {
  const mapped = mappedFields(mapping)
  return fields.filter((field) => field.required && !mapped.has(field.field))
}

export function mappedFieldsInOrder(
  mapping: ImportMapping,
  fields: ReadonlyArray<ImportFieldDef>,
): ImportFieldDef[] {
  const mapped = mappedFields(mapping)
  return fields.filter((field) => mapped.has(field.field))
}

export function previewCounts(preview: ValidationPreview | undefined): {
  valid: number
  invalid: number
} {
  return { valid: preview?.validRows ?? 0, invalid: preview?.invalidRows ?? 0 }
}
