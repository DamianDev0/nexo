import { DocumentType } from '@repo/shared-types'
import { contactImportMapper, documentNumberError } from '../constants/contact-import.mapper'

describe('contactImportMapper', () => {
  describe('normalizeValue', () => {
    it('lowercases and trims emails so duplicates match', () => {
      expect(contactImportMapper.normalizeValue('email', '  Ana@Empresa.CO ')).toBe(
        'ana@empresa.co',
      )
    })

    it('reduces phones to their national digits', () => {
      expect(contactImportMapper.normalizeValue('phone', '+57 (300) 123-4567')).toBe('3001234567')
      expect(contactImportMapper.normalizeValue('whatsapp', '310 999 8877')).toBe('3109998877')
    })

    it('strips separators from document numbers', () => {
      expect(contactImportMapper.normalizeValue('documentNumber', '1.000.324-679')).toBe(
        '1000324679',
      )
    })

    it('slugs taxonomy values so accents and spacing stop mattering', () => {
      expect(contactImportMapper.normalizeValue('status', 'En Contacto')).toBe('en_contacto')
      expect(contactImportMapper.normalizeValue('lifecycleStage', ' Opportunity ')).toBe(
        'opportunity',
      )
      expect(contactImportMapper.normalizeValue('documentType', 'CC')).toBe('cc')
    })

    it('splits tags on semicolons and commas', () => {
      expect(contactImportMapper.normalizeValue('tags', 'VIP; Frío , Referido')).toEqual([
        'VIP',
        'Frío',
        'Referido',
      ])
    })

    it('reads a lead score out of a noisy cell', () => {
      expect(contactImportMapper.normalizeValue('leadScore', '82 pts')).toBe(82)
      expect(contactImportMapper.normalizeValue('leadScore', 'n/a')).toBe(0)
    })
  })

  describe('validateField', () => {
    it('accepts empty cells because most columns are optional', () => {
      expect(contactImportMapper.validateField('email', '')).toBeNull()
    })

    it('rejects a malformed email', () => {
      expect(contactImportMapper.validateField('email', 'ana@')).not.toBeNull()
      expect(contactImportMapper.validateField('email', 'ana@empresa.co')).toBeNull()
    })

    it('rejects a phone with too few digits to dial', () => {
      expect(contactImportMapper.validateField('phone', '12345')).not.toBeNull()
      expect(contactImportMapper.validateField('phone', '3001234567')).toBeNull()
    })

    it('rejects unknown document types and lifecycle stages', () => {
      expect(contactImportMapper.validateField('documentType', 'passport')).not.toBeNull()
      expect(contactImportMapper.validateField('documentType', 'cc')).toBeNull()
      expect(contactImportMapper.validateField('lifecycleStage', 'prospect')).not.toBeNull()
      expect(contactImportMapper.validateField('lifecycleStage', 'lead')).toBeNull()
    })

    it('keeps the lead score inside its range', () => {
      expect(contactImportMapper.validateField('leadScore', 140)).not.toBeNull()
      expect(contactImportMapper.validateField('leadScore', 82)).toBeNull()
    })

    it('leaves tenant taxonomy values alone — the tenant owns those keys', () => {
      expect(contactImportMapper.validateField('status', 'cualquier_estado')).toBeNull()
      expect(contactImportMapper.validateField('source', 'feria_regional')).toBeNull()
    })
  })

  describe('documentNumberError', () => {
    it('validates the number against its declared type', () => {
      expect(documentNumberError(DocumentType.CC, '1000324679')).toBeNull()
      expect(documentNumberError(DocumentType.CC, 'ABC')).not.toBeNull()
    })

    it('stays quiet when either half is missing or the type is unknown', () => {
      expect(documentNumberError(null, '1000324679')).toBeNull()
      expect(documentNumberError(DocumentType.CC, null)).toBeNull()
      expect(documentNumberError('passport', '1000324679')).toBeNull()
    })
  })
})
