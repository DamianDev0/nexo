import { describe, expect, it } from 'vitest'

import {
  customFieldDatePart,
  nextCustomFieldDate,
  withCustomField,
} from '@/entities/contact/lib/custom-field-edit'

describe('customFieldDatePart', () => {
  it('extracts the date part from date and datetime strings', () => {
    expect(customFieldDatePart('1990-04-15')).toBe('1990-04-15')
    expect(customFieldDatePart('1990-04-15T09:30')).toBe('1990-04-15')
  })

  it('returns null for non-strings and malformed values', () => {
    expect(customFieldDatePart(undefined)).toBeNull()
    expect(customFieldDatePart(42)).toBeNull()
    expect(customFieldDatePart('15/04/1990')).toBeNull()
  })
})

describe('nextCustomFieldDate', () => {
  it('keeps the stored time when editing a datetime', () => {
    expect(nextCustomFieldDate('datetime', '1990-04-15T09:30', '1991-05-20')).toBe(
      '1991-05-20T09:30',
    )
  })

  it('returns the plain iso for date fields or missing time', () => {
    expect(nextCustomFieldDate('date', '1990-04-15', '1991-05-20')).toBe('1991-05-20')
    expect(nextCustomFieldDate('datetime', undefined, '1991-05-20')).toBe('1991-05-20')
  })
})

describe('withCustomField', () => {
  it('merges into existing fields without mutating', () => {
    const fields = { birthday: '1990-04-15' }
    const next = withCustomField(fields, 'vip', true)
    expect(next).toEqual({ birthday: '1990-04-15', vip: true })
    expect(fields).toEqual({ birthday: '1990-04-15' })
  })

  it('starts from empty when fields are undefined', () => {
    expect(withCustomField(undefined, 'vip', false)).toEqual({ vip: false })
  })
})
