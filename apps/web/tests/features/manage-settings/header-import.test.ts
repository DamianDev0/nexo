import { describe, expect, it } from 'vitest'

import type { HeaderImportRow } from '@/features/manage-settings/lib/header-import'
import type { CustomFieldHeaderSuggestion, FieldDef } from '@repo/shared-types'

import {
  buildImportFieldDefs,
  includedRows,
  toImportRows,
  updateImportRow,
} from '@/features/manage-settings/lib/header-import'

function suggestion(
  overrides: Partial<CustomFieldHeaderSuggestion> = {},
): CustomFieldHeaderSuggestion {
  return {
    column: 'Presupuesto',
    sampleValues: ['100', '200'],
    fillRate: 0.9,
    suggestedKey: 'presupuesto',
    suggestedLabel: 'Presupuesto',
    suggestedType: 'number',
    existingFieldKey: null,
    ...overrides,
  }
}

function row(overrides: Partial<HeaderImportRow> = {}): HeaderImportRow {
  return {
    column: 'Presupuesto',
    sampleValues: ['100', '200'],
    include: true,
    label: 'Presupuesto',
    type: 'number',
    suggestedKey: 'presupuesto',
    existingFieldKey: null,
    ...overrides,
  }
}

function field(overrides: Partial<FieldDef> = {}): FieldDef {
  return {
    key: 'ciudad',
    label: 'Ciudad',
    type: 'text',
    required: false,
    unique: false,
    order: 1,
    isActive: true,
    ...overrides,
  }
}

describe('toImportRows', () => {
  it('includes new columns and excludes matches of existing fields', () => {
    const rows = toImportRows([
      suggestion(),
      suggestion({ column: 'Ciudad', existingFieldKey: 'ciudad' }),
    ])

    expect(rows[0]?.include).toBe(true)
    expect(rows[1]?.include).toBe(false)
    expect(rows[1]?.existingFieldKey).toBe('ciudad')
  })

  it('falls back to text for non-creatable suggested types and caps samples at 3', () => {
    const rows = toImportRows([
      suggestion({ suggestedType: 'formula', sampleValues: ['a', 'b', 'c', 'd'] }),
    ])

    expect(rows[0]?.type).toBe('text')
    expect(rows[0]?.sampleValues).toEqual(['a', 'b', 'c'])
  })
})

describe('updateImportRow', () => {
  it('patches only the matching column', () => {
    const rows = [row(), row({ column: 'Zona' })]
    const next = updateImportRow(rows, 'Zona', { label: 'Zona comercial', include: false })

    expect(next[0]?.label).toBe('Presupuesto')
    expect(next[1]?.label).toBe('Zona comercial')
    expect(next[1]?.include).toBe(false)
  })
})

describe('includedRows', () => {
  it('drops excluded rows and blank labels', () => {
    const rows = [row(), row({ column: 'A', include: false }), row({ column: 'B', label: '  ' })]

    expect(includedRows(rows).map((r) => r.column)).toEqual(['Presupuesto'])
  })
})

describe('buildImportFieldDefs', () => {
  it('builds defs appended after existing fields with uniquified keys', () => {
    const defs = buildImportFieldDefs(
      [row({ suggestedKey: 'ciudad', label: 'Ciudad', type: 'text' }), row()],
      [field()],
    )

    expect(defs).toHaveLength(2)
    expect(defs[0]?.key).toBe('ciudad_2')
    expect(defs[0]?.order).toBe(2)
    expect(defs[1]?.key).toBe('presupuesto')
    expect(defs[1]?.order).toBe(3)
    expect(defs.every((def) => def.isActive === true && def.showInForm === true)).toBe(true)
  })

  it('slugifies from the label when the suggested key is empty', () => {
    const defs = buildImportFieldDefs([row({ suggestedKey: '', label: 'Zona Comercial' })], [])

    expect(defs[0]?.key).toBe('zona_comercial')
  })

  it('seeds select options from the sample values', () => {
    const defs = buildImportFieldDefs([row({ type: 'select', sampleValues: ['Alta', 'Baja'] })], [])

    expect(defs[0]?.options?.map((option) => option.label)).toEqual(['Alta', 'Baja'])
  })
})
