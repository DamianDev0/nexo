import { describe, expect, it } from 'vitest'

import { activeFields, buildFieldDef } from '@/features/manage-settings/lib/custom-field-edit'

import type { FieldDef } from '@repo/shared-types'

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
    const result = buildFieldDef('Metros cuadrados', 'number', [])

    expect(result.key).toBe('metros_cuadrados')
    expect(result.label).toBe('Metros cuadrados')
    expect(result.type).toBe('number')
    expect(result.isActive).toBe(true)
  })

  it('avoids colliding with existing keys, including archived ones', () => {
    const existing = [field({ key: 'metros_cuadrados', isActive: false })]

    const result = buildFieldDef('Metros cuadrados', 'number', existing)

    expect(result.key).toBe('metros_cuadrados_2')
  })

  it('appends at the end of the existing order', () => {
    const existing = [field({ key: 'a', order: 1 }), field({ key: 'b', order: 2 })]

    expect(buildFieldDef('Nuevo', 'text', existing).order).toBe(3)
  })
})
