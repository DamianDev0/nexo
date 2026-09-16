import { describe, expect, it } from 'vitest'

import {
  joinDateTime,
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
