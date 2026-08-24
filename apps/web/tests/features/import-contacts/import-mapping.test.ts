import { describe, expect, it } from 'vitest'

import type { ImportFieldDef, ValidationPreview } from '@repo/shared-types'

import { IMPORT_UNMAPPED } from '@/features/import-contacts/config/import-contacts.constants'
import {
  applyMapping,
  mappedFieldsInOrder,
  missingRequiredFields,
  previewCounts,
} from '@/features/import-contacts/lib/import-mapping'

const FIELDS: ImportFieldDef[] = [
  { field: 'firstName', label: 'First name', required: true, aliases: [] },
  { field: 'email', label: 'Email', required: false, aliases: [] },
  { field: 'city', label: 'City', required: false, aliases: [] },
]

function preview(valid: number, invalid: number): ValidationPreview {
  return { totalSampleRows: valid + invalid, validRows: valid, invalidRows: invalid, rows: [] }
}

describe('applyMapping', () => {
  it('assigns the field to the chosen column', () => {
    expect(applyMapping({ Correo: null }, 'Correo', 'email')).toEqual({ Correo: 'email' })
  })

  it('steals the field from whichever column had it, so no field maps twice', () => {
    const mapping = { Correo: 'email', Mail: null }

    expect(applyMapping(mapping, 'Mail', 'email')).toEqual({ Correo: null, Mail: 'email' })
  })

  it('clears the column without touching the others', () => {
    const mapping = { Correo: 'email', Ciudad: 'city' }

    expect(applyMapping(mapping, 'Correo', IMPORT_UNMAPPED)).toEqual({
      Correo: null,
      Ciudad: 'city',
    })
  })
})

describe('missingRequiredFields', () => {
  it('names the required fields nobody mapped', () => {
    expect(missingRequiredFields({ Correo: 'email' }, FIELDS).map((f) => f.field)).toEqual([
      'firstName',
    ])
  })

  it('is empty once every required field has a column', () => {
    expect(missingRequiredFields({ Nombre: 'firstName' }, FIELDS)).toEqual([])
  })
})

describe('mappedFieldsInOrder', () => {
  it('keeps the catalog order regardless of column order', () => {
    const mapping = { Ciudad: 'city', Nombre: 'firstName' }

    expect(mappedFieldsInOrder(mapping, FIELDS).map((f) => f.field)).toEqual(['firstName', 'city'])
  })
})

describe('previewCounts', () => {
  it('reads zero when there is no preview yet', () => {
    expect(previewCounts(undefined)).toEqual({ valid: 0, invalid: 0 })
  })

  it('passes the sample counts through', () => {
    expect(previewCounts(preview(3, 1))).toEqual({ valid: 3, invalid: 1 })
  })
})
