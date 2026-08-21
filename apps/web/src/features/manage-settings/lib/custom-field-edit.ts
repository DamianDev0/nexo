import { slugifyTaxonomyKey } from './taxonomy-edit'

import type { CustomFieldType, FieldDef } from '@repo/shared-types'

export function activeFields(fields: ReadonlyArray<FieldDef>): FieldDef[] {
  return fields.filter((field) => field.isActive !== false).sort((a, b) => a.order - b.order)
}

export function buildFieldDef(
  label: string,
  type: CustomFieldType,
  existing: ReadonlyArray<FieldDef>,
): FieldDef {
  const taken = new Set(existing.map((field) => field.key))
  return {
    key: slugifyTaxonomyKey(label, taken),
    label: label.trim(),
    type,
    required: false,
    unique: false,
    order: existing.length + 1,
    isActive: true,
  }
}
