import { describe, expect, it } from 'vitest'

import {
  formatCustomFieldValue,
  joinDateTime,
  parseCustomFieldNumber,
  splitDateTimeValue,
  toggleListItem,
} from '@/features/create-contact/lib/custom-field-input'

describe('toggleListItem', () => {
  it('adds when absent and removes when present', () => {
    expect(toggleListItem(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleListItem(['a', 'b'], 'a')).toEqual(['b'])
  })

  it('starts from empty for non-array values', () => {
    expect(toggleListItem(undefined, 'x')).toEqual(['x'])
    expect(toggleListItem('junk', 'x')).toEqual(['x'])
  })
})

describe('splitDateTimeValue / joinDateTime', () => {
  it('splits an ISO datetime into date and minute parts', () => {
    expect(splitDateTimeValue('1990-04-15T09:30')).toEqual({ date: '1990-04-15', time: '09:30' })
    expect(splitDateTimeValue(undefined)).toEqual({ date: '', time: '' })
  })

  it('joins with a midnight fallback', () => {
    expect(joinDateTime('1990-04-15', '09:30')).toBe('1990-04-15T09:30')
    expect(joinDateTime('1990-04-15', '')).toBe('1990-04-15T00:00')
  })
})

describe('currency cents conversion', () => {
  it('parses pesos into integer centavos with exact rounding', () => {
    expect(parseCustomFieldNumber('12345.67', true)).toBe(1234567)
    expect(parseCustomFieldNumber('0.1', true)).toBe(10)
    expect(parseCustomFieldNumber('100000', true)).toBe(10000000)
    expect(Number.isInteger(parseCustomFieldNumber('19.99', true))).toBe(true)
  })

  it('keeps plain numbers untouched and empty as empty', () => {
    expect(parseCustomFieldNumber('42', false)).toBe(42)
    expect(parseCustomFieldNumber('', true)).toBe('')
  })

  it('formats centavos back to pesos for display', () => {
    expect(formatCustomFieldValue(1234567, true)).toBe('12345.67')
    expect(formatCustomFieldValue(42, false)).toBe('42')
    expect(formatCustomFieldValue(null, true)).toBe('')
  })
})
