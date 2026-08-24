import { describe, expect, it } from 'vitest'

import type { CustomFieldColumn } from '@/entities/contact/lib/custom-field-display'
import type { TFunction } from 'i18next'

import { customFieldBadges, customFieldDisplay } from '@/entities/contact/lib/custom-field-display'

const t = ((key: string) => key) as TFunction

function column(overrides: CustomFieldColumn = {}): CustomFieldColumn {
  return overrides
}

describe('customFieldDisplay', () => {
  it('returns empty for null, undefined and empty string', () => {
    expect(customFieldDisplay(column(), null, t).text).toBeNull()
    expect(customFieldDisplay(column(), undefined, t).text).toBeNull()
    expect(customFieldDisplay(column(), '', t).text).toBeNull()
  })

  it('formats currency from COP cents', () => {
    const display = customFieldDisplay(column({ fieldType: 'currency' }), 50_000_000, t)

    expect(display.text).toBe('$500.000')
    expect(display.numeric).toBe(true)
  })

  it('formats a date-only value as DD/MM/YYYY without timezone drift', () => {
    const display = customFieldDisplay(column({ fieldType: 'date' }), '2026-08-21', t)

    expect(display.text).toBe('21/08/2026')
    expect(display.numeric).toBe(true)
  })

  it('translates booleans through common.yes and common.no', () => {
    expect(customFieldDisplay(column({ fieldType: 'boolean' }), true, t).text).toBe('common.yes')
    expect(customFieldDisplay(column({ fieldType: 'boolean' }), false, t).text).toBe('common.no')
  })

  it('resolves select values to their option label', () => {
    const def = column({
      fieldType: 'select',
      fieldOptions: [{ value: 'teja', label: 'Teja de barro' }],
    })

    expect(customFieldDisplay(def, 'teja', t).text).toBe('Teja de barro')
    expect(customFieldDisplay(def, 'desconocida', t).text).toBe('desconocida')
  })

  it('joins multiselect values with their labels', () => {
    const def = column({
      fieldType: 'multiselect',
      fieldOptions: [
        { value: 'teja', label: 'Teja' },
        { value: 'zinc', label: 'Zinc' },
      ],
    })

    expect(customFieldDisplay(def, ['teja', 'zinc'], t).text).toBe('Teja, Zinc')
  })

  it('falls back to plain text for untyped values', () => {
    expect(customFieldDisplay(column(), 'hola', t).text).toBe('hola')
    expect(customFieldDisplay(column(), ['a', 'b'], t).text).toBe('a, b')
    expect(customFieldDisplay(column(), { nested: 1 }, t).text).toBe('{"nested":1}')
  })

  it('keeps plain numbers unformatted but right-aligned', () => {
    const display = customFieldDisplay(column({ fieldType: 'number' }), 120, t)

    expect(display.text).toBe('120')
    expect(display.numeric).toBe(true)
  })
})

describe('customFieldBadges', () => {
  it('maps select values to badges with option color', () => {
    const def = column({
      fieldType: 'select',
      fieldOptions: [{ value: 'teja', label: 'Teja', color: '#123456' }],
    })

    expect(customFieldBadges(def, 'teja')).toEqual([{ label: 'Teja', color: '#123456' }])
  })

  it('returns one badge per multiselect value', () => {
    const def = column({
      fieldType: 'multiselect',
      fieldOptions: [
        { value: 'teja', label: 'Teja' },
        { value: 'zinc', label: 'Zinc' },
      ],
    })

    expect(customFieldBadges(def, ['teja', 'zinc']).map((badge) => badge.label)).toEqual([
      'Teja',
      'Zinc',
    ])
  })

  it('returns no badges for non-select types or empty values', () => {
    expect(customFieldBadges(column({ fieldType: 'text' }), 'hola')).toEqual([])
    expect(customFieldBadges(column({ fieldType: 'select' }), '')).toEqual([])
  })
})
