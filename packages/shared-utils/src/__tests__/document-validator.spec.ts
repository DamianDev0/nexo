import { DocumentType } from '@repo/shared-types'

import { normalizeDocumentNumber, validateDocumentNumber } from '../document-validator'

describe('normalizeDocumentNumber', () => {
  it('drops the separators a person types so the same document is stored one way', () => {
    expect(normalizeDocumentNumber('900.123.456-7')).toBe('9001234567')
    expect(normalizeDocumentNumber('1 000 324 679')).toBe('1000324679')
    expect(normalizeDocumentNumber('1000324679')).toBe('1000324679')
  })

  it('leaves alphanumeric documents intact', () => {
    expect(normalizeDocumentNumber('AB1234567')).toBe('AB1234567')
  })
})

describe('validateDocumentNumber', () => {
  it('accepts a formatted document because it validates the normalized value', () => {
    expect(validateDocumentNumber(DocumentType.CC, '1.000.324.679').isValid).toBe(true)
  })
})
