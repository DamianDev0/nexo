import { describe, expect, it } from 'vitest'

import {
  customFieldFromInput,
  customFieldToInput,
  isCurrencyField,
  isNumericField,
} from '@/entities/contact/lib/custom-field-value'

const TYPES = ['text', 'number', 'currency', 'date'] as const

describe('custom field value round trip', () => {
  it('stores money as integer centavos and shows it back as pesos', () => {
    expect(customFieldFromInput('500000', 'currency')).toBe(50000000)
    expect(customFieldFromInput('12345.67', 'currency')).toBe(1234567)
    expect(customFieldFromInput('19.99', 'currency')).toBe(1999)
    expect(customFieldToInput(50000000, 'currency')).toBe('500000')
  })

  it('survives a round trip for every editable type', () => {
    const samples: Record<(typeof TYPES)[number], string> = {
      text: 'Zona norte',
      number: '42',
      currency: '2500000',
      date: '1990-04-15',
    }
    for (const type of TYPES) {
      const stored = customFieldFromInput(samples[type], type)
      expect(customFieldToInput(stored, type)).toBe(samples[type])
    }
  })

  it('treats an empty input as no value and a broken number as no value', () => {
    expect(customFieldFromInput('', 'currency')).toBeNull()
    expect(customFieldFromInput('abc', 'number')).toBeNull()
    expect(customFieldToInput(null, 'currency')).toBe('')
    expect(customFieldToInput(undefined, 'text')).toBe('')
  })

  it('keeps text fields untouched', () => {
    expect(customFieldFromInput('1.500', 'text')).toBe('1.500')
    expect(isCurrencyField('currency')).toBe(true)
    expect(isNumericField('number')).toBe(true)
    expect(isNumericField('text')).toBe(false)
  })
})
