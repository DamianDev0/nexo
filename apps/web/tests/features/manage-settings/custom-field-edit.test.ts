import { describe, expect, it } from 'vitest'

import type { FieldFormValues } from '@/features/manage-settings/lib/custom-field-edit'
import type { FieldDef } from '@repo/shared-types'

import {
  activeFields,
  buildFieldDef,
  buildSelectOptions,
  fieldHasOptions,
  fieldPatch,
  reorderFieldDefs,
  toFormValues,
} from '@/features/manage-settings/lib/custom-field-edit'

function field(overrides: Partial<FieldDef> = {}): FieldDef {
  return {
    key: 'budget',
    label: 'Budget',
    type: 'number',
    required: false,
    unique: false,
    order: 1,
    isActive: true,
    ...overrides,
  }
}

function formValues(overrides: Partial<FieldFormValues> = {}): FieldFormValues {
  return {
    label: 'Metros cuadrados',
    type: 'number',
    required: false,
    showInForm: true,
    optionLabels: [],
    ...overrides,
  }
}

describe('activeFields', () => {
  it('drops archived fields and sorts by order', () => {
    const result = activeFields([
      field({ key: 'b', order: 2 }),
      field({ key: 'archived', isActive: false }),
      field({ key: 'a', order: 1 }),
    ])

    expect(result.map((f) => f.key)).toEqual(['a', 'b'])
  })

  it('treats a missing isActive flag as active', () => {
    const legacy = field()
    delete legacy.isActive

    expect(activeFields([legacy])).toHaveLength(1)
  })
})

describe('buildFieldDef', () => {
  it('slugifies the label into a stable key', () => {
    const result = buildFieldDef(formValues(), [])

    expect(result.key).toBe('metros_cuadrados')
    expect(result.label).toBe('Metros cuadrados')
    expect(result.type).toBe('number')
    expect(result.isActive).toBe(true)
  })

  it('avoids colliding with existing keys, including archived ones', () => {
    const existing = [field({ key: 'metros_cuadrados', isActive: false })]

    const result = buildFieldDef(formValues(), existing)

    expect(result.key).toBe('metros_cuadrados_2')
  })

  it('appends at the end of the existing order', () => {
    const existing = [field({ key: 'a', order: 1 }), field({ key: 'b', order: 2 })]

    expect(buildFieldDef(formValues({ label: 'Nuevo', type: 'text' }), existing).order).toBe(3)
  })

  it('keeps the required flag and builds options for select fields', () => {
    const result = buildFieldDef(
      formValues({ type: 'select', required: true, optionLabels: ['Teja', 'Lámina'] }),
      [],
    )

    expect(result.required).toBe(true)
    expect(result.options?.map((option) => option.label)).toEqual(['Teja', 'Lámina'])
  })
})

describe('buildSelectOptions', () => {
  it('drops empty labels and slugifies values', () => {
    const result = buildSelectOptions(['Teja', ' ', 'Lámina'])

    expect(result.map((option) => option.value)).toEqual(['teja', 'lamina'])
  })

  it('preserves value and color of an existing option with the same label', () => {
    const existing = [{ value: 'teja', label: 'Teja', color: '#123456' }]

    const result = buildSelectOptions(['Teja', 'Nueva'], existing)

    expect(result[0]).toEqual(existing[0])
    expect(result[1]?.value).toBe('nueva')
  })
})

describe('fieldPatch', () => {
  it('updates label, required and showInForm without touching the key', () => {
    const patch = fieldPatch(
      field(),
      formValues({ label: 'Presupuesto', required: true, showInForm: false }),
    )

    expect(patch).toEqual({ label: 'Presupuesto', required: true, showInForm: false })
  })

  it('rebuilds options for select fields preserving matches', () => {
    const selectField = field({
      key: 'techo',
      type: 'select',
      options: [{ value: 'teja', label: 'Teja', color: '#123456' }],
    })

    const patch = fieldPatch(
      selectField,
      formValues({ type: 'select', optionLabels: ['Teja', 'Zinc'] }),
    )

    expect(patch.options?.[0]?.value).toBe('teja')
    expect(patch.options?.[1]?.label).toBe('Zinc')
  })
})

describe('toFormValues', () => {
  it('maps a field def into editable form values', () => {
    const selectField = field({
      type: 'select',
      required: true,
      options: [{ value: 'teja', label: 'Teja' }],
    })

    expect(toFormValues(selectField)).toEqual({
      label: 'Budget',
      type: 'select',
      required: true,
      showInForm: true,
      optionLabels: ['Teja'],
    })
  })
})

describe('fieldHasOptions', () => {
  it('is true only for select and multiselect', () => {
    expect(fieldHasOptions('select')).toBe(true)
    expect(fieldHasOptions('multiselect')).toBe(true)
    expect(fieldHasOptions('text')).toBe(false)
  })
})

describe('reorderFieldDefs', () => {
  const fields = [
    field({ key: 'a', order: 1 }),
    field({ key: 'b', order: 2 }),
    field({ key: 'c', order: 3 }),
    field({ key: 'archived', order: 4, isActive: false }),
  ]

  it('moves a field and renumbers active orders', () => {
    const result = reorderFieldDefs(fields, 'c', 'a')

    const orders = Object.fromEntries(result.map((f) => [f.key, f.order]))
    expect(orders).toMatchObject({ c: 1, a: 2, b: 3 })
  })

  it('keeps archived fields untouched', () => {
    const result = reorderFieldDefs(fields, 'c', 'a')

    expect(result.find((f) => f.key === 'archived')?.order).toBe(4)
  })

  it('returns the list unchanged when a key is unknown', () => {
    expect(reorderFieldDefs(fields, 'missing', 'a')).toEqual(fields)
  })
})
