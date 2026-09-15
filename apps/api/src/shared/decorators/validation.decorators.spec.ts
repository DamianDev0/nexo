import { validate } from 'class-validator'
import { IsOptional } from 'class-validator'
import { IsCOPhone } from './is-co-phone.decorator'
import { IsDocumentNumberFor } from './is-document-number.decorator'
import { IsBoundedObject, isBoundedObject } from './is-bounded-object.decorator'

class Sample {
  @IsOptional()
  @IsCOPhone()
  phone?: string

  @IsOptional()
  documentType?: string

  @IsOptional()
  @IsDocumentNumberFor('documentType')
  documentNumber?: string

  @IsOptional()
  @IsBoundedObject({ maxKeys: 2, maxBytes: 64 })
  payload?: Record<string, unknown>
}

async function errorsFor(fields: Partial<Sample>): Promise<string[]> {
  const sample = Object.assign(new Sample(), fields)
  return (await validate(sample)).map((error) => error.property)
}

describe('IsCOPhone', () => {
  it('accepts Colombian mobiles and landlines in any common format', async () => {
    await expect(errorsFor({ phone: '3001234567' })).resolves.toEqual([])
    await expect(errorsFor({ phone: '+57 300 123 4567' })).resolves.toEqual([])
    await expect(errorsFor({ phone: '6012345678' })).resolves.toEqual([])
  })

  it('rejects short, foreign or non-numeric numbers', async () => {
    await expect(errorsFor({ phone: '12345' })).resolves.toEqual(['phone'])
    await expect(errorsFor({ phone: '4155551234' })).resolves.toEqual(['phone'])
  })
})

describe('IsDocumentNumberFor', () => {
  it('validates the DIAN check digit for NIT', async () => {
    await expect(errorsFor({ documentType: 'nit', documentNumber: '9001234568' })).resolves.toEqual(
      [],
    )
    await expect(errorsFor({ documentType: 'nit', documentNumber: '9001234567' })).resolves.toEqual(
      ['documentNumber'],
    )
  })

  it('applies the per-type length and character rules', async () => {
    await expect(errorsFor({ documentType: 'cc', documentNumber: '123' })).resolves.toEqual([
      'documentNumber',
    ])
    await expect(errorsFor({ documentType: 'cc', documentNumber: '1032456789' })).resolves.toEqual(
      [],
    )
    await expect(errorsFor({ documentType: 'pp', documentNumber: 'AB123456' })).resolves.toEqual([])
  })

  it('only checks the format when a known document type accompanies the number', async () => {
    await expect(errorsFor({ documentNumber: 'anything' })).resolves.toEqual([])
  })
})

describe('IsBoundedObject', () => {
  it('rejects arrays, null and oversized objects', () => {
    expect(isBoundedObject([], {})).toBe(false)
    expect(isBoundedObject(null, {})).toBe(false)
    expect(isBoundedObject({ a: 1, b: 2, c: 3 }, { maxKeys: 2 })).toBe(false)
    expect(isBoundedObject({ a: 'x'.repeat(100) }, { maxBytes: 64 })).toBe(false)
  })

  it('accepts objects inside the bounds through the decorator', async () => {
    await expect(errorsFor({ payload: { a: 1, b: 'two' } })).resolves.toEqual([])
    await expect(errorsFor({ payload: { a: 1, b: 2, c: 3 } })).resolves.toEqual(['payload'])
  })
})
