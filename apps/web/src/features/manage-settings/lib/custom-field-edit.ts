import { taxonomyColorAt } from '@repo/shared-types'

import { slugifyTaxonomyKey } from './taxonomy-edit'

import type { CustomFieldType, FieldDef, SelectOption } from '@repo/shared-types'

export type FieldFormValues = {
  label: string
  type: CustomFieldType
  required: boolean
  showInForm: boolean
  optionLabels: ReadonlyArray<string>
}

const OPTION_TYPES: ReadonlyArray<CustomFieldType> = ['select', 'multiselect']

export function fieldHasOptions(type: CustomFieldType): boolean {
  return OPTION_TYPES.includes(type)
}

export function activeFields(fields: ReadonlyArray<FieldDef>): FieldDef[] {
  return fields.filter((field) => field.isActive !== false).sort((a, b) => a.order - b.order)
}

export function buildSelectOptions(
  labels: ReadonlyArray<string>,
  existing: ReadonlyArray<SelectOption> = [],
): SelectOption[] {
  const byLabel = new Map(existing.map((option) => [option.label, option]))
  const taken = new Set<string>()

  return labels
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label, index) => {
      const match = byLabel.get(label)
      const option = match ?? {
        value: slugifyTaxonomyKey(label, taken),
        label,
        color: taxonomyColorAt(index),
      }
      taken.add(option.value)
      return option
    })
}

export function buildFieldDef(
  values: FieldFormValues,
  existing: ReadonlyArray<FieldDef>,
): FieldDef {
  const taken = new Set(existing.map((field) => field.key))
  return {
    key: slugifyTaxonomyKey(values.label, taken),
    label: values.label.trim(),
    type: values.type,
    required: values.required,
    showInForm: values.showInForm,
    unique: false,
    order: existing.length + 1,
    isActive: true,
    ...(fieldHasOptions(values.type) && { options: buildSelectOptions(values.optionLabels) }),
  }
}

export function fieldPatch(field: FieldDef, values: FieldFormValues): Partial<FieldDef> {
  return {
    label: values.label.trim(),
    required: values.required,
    showInForm: values.showInForm,
    ...(fieldHasOptions(field.type) && {
      options: buildSelectOptions(values.optionLabels, field.options ?? []),
    }),
  }
}

export function toFormValues(field: FieldDef): FieldFormValues {
  return {
    label: field.label,
    type: field.type,
    required: field.required,
    showInForm: field.showInForm !== false,
    optionLabels: (field.options ?? []).map((option) => option.label),
  }
}

export function reorderFieldDefs(
  fields: ReadonlyArray<FieldDef>,
  fromKey: string,
  toKey: string,
): FieldDef[] {
  const active = activeFields(fields)
  const fromIndex = active.findIndex((field) => field.key === fromKey)
  const toIndex = active.findIndex((field) => field.key === toKey)
  if (fromIndex === -1 || toIndex === -1) return [...fields]

  const next = [...active]
  const [moved] = next.splice(fromIndex, 1)
  if (!moved) return [...fields]
  next.splice(toIndex, 0, moved)

  const orderByKey = new Map(next.map((field, index) => [field.key, index + 1]))
  return fields.map((field) => {
    const order = orderByKey.get(field.key)
    return order === undefined ? field : { ...field, order }
  })
}
