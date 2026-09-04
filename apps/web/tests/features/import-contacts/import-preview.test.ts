import { describe, expect, it } from 'vitest'

import { IMPORT_EMPTY_CELL } from '@/features/import-contacts/config/import-contacts.constants'
import { cellValue } from '@/features/import-contacts/lib/import-preview'

describe('cellValue', () => {
  it('joins array values with a comma separator', () => {
    expect(cellValue(['VIP', 'Referido'])).toBe('VIP, Referido')
  })

  it('shows the empty marker for an empty array', () => {
    expect(cellValue([])).toBe(IMPORT_EMPTY_CELL)
  })

  it('passes non-empty strings through', () => {
    expect(cellValue('Medellín')).toBe('Medellín')
  })

  it('shows the empty marker for an empty string', () => {
    expect(cellValue('')).toBe(IMPORT_EMPTY_CELL)
  })

  it('stringifies numbers and booleans', () => {
    expect(cellValue(80)).toBe('80')
    expect(cellValue(false)).toBe('false')
  })

  it('shows the empty marker for null, undefined and objects', () => {
    expect(cellValue(null)).toBe(IMPORT_EMPTY_CELL)
    expect(cellValue(undefined)).toBe(IMPORT_EMPTY_CELL)
    expect(cellValue({})).toBe(IMPORT_EMPTY_CELL)
  })
})
