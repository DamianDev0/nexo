import { CREATABLE_FIELD_TYPES } from '../config/custom-fields.constants'

import { buildSelectOptions, fieldHasOptions } from './custom-field-edit'
import { slugifyTaxonomyKey } from './taxonomy-edit'

import type {
  CustomFieldHeaderSuggestion,
  CustomFieldType,
  FieldDef,
} from '@repo/shared-types'

export type HeaderImportRow = {
  column: string
  sampleValues: string[]
  include: boolean
  label: string
  type: CustomFieldType
  suggestedKey: string
  existingFieldKey: string | null
}

const MAX_SAMPLE_VALUES = 3

export function toImportRows(
  suggestions: ReadonlyArray<CustomFieldHeaderSuggestion>,
): HeaderImportRow[] {
  return suggestions.map((suggestion) => ({
    column: suggestion.column,
    sampleValues: suggestion.sampleValues.slice(0, MAX_SAMPLE_VALUES),
    include: suggestion.existingFieldKey === null,
    label: suggestion.suggestedLabel,
    type: CREATABLE_FIELD_TYPES.includes(suggestion.suggestedType)
      ? suggestion.suggestedType
      : 'text',
    suggestedKey: suggestion.suggestedKey,
    existingFieldKey: suggestion.existingFieldKey,
  }))
}

export function updateImportRow(
  rows: ReadonlyArray<HeaderImportRow>,
  column: string,
  patch: Partial<Pick<HeaderImportRow, 'include' | 'label' | 'type'>>,
): HeaderImportRow[] {
  return rows.map((row) => (row.column === column ? { ...row, ...patch } : row))
}

export function includedRows(rows: ReadonlyArray<HeaderImportRow>): HeaderImportRow[] {
  return rows.filter((row) => row.include && row.label.trim().length > 0)
}

export function buildImportFieldDefs(
  rows: ReadonlyArray<HeaderImportRow>,
  existing: ReadonlyArray<FieldDef>,
): FieldDef[] {
  const taken = new Set(existing.map((field) => field.key))
  const defs: FieldDef[] = []

  for (const row of includedRows(rows)) {
    const source = row.suggestedKey.length > 0 ? row.suggestedKey : row.label
    const key = slugifyTaxonomyKey(source, taken)
    taken.add(key)
    defs.push({
      key,
      label: row.label.trim(),
      type: row.type,
      required: false,
      unique: false,
      order: existing.length + defs.length + 1,
      isActive: true,
      showInForm: true,
      ...(fieldHasOptions(row.type) && { options: buildSelectOptions(row.sampleValues) }),
    })
  }

  return defs
}
