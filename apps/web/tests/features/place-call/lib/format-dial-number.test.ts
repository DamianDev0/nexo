import { describe, expect, it } from 'vitest'

import {
  formatDialNumber,
  isDialChar,
  toDialString,
} from '@/features/place-call/lib/format-dial-number'

describe('isDialChar', () => {
  it('accepts digits, star, hash and plus', () => {
    for (const char of ['0', '9', '*', '#', '+']) expect(isDialChar(char)).toBe(true)
  })

  it('rejects letters, spaces and multi-char strings', () => {
    for (const char of ['a', ' ', '', '12', '-']) expect(isDialChar(char)).toBe(false)
  })
})

describe('toDialString', () => {
  it('strips formatting but keeps a leading plus', () => {
    expect(toDialString('+57 300-123 4567')).toBe('+573001234567')
  })

  it('drops pluses that are not leading', () => {
    expect(toDialString('300+123')).toBe('300123')
  })

  it('keeps star and hash', () => {
    expect(toDialString('*611#')).toBe('*611#')
  })

  it('returns empty for input without dial characters', () => {
    expect(toDialString('sin datos')).toBe('')
  })
})

describe('formatDialNumber', () => {
  it('returns the empty string untouched', () => {
    expect(formatDialNumber('')).toBe('')
  })

  it('leaves short numbers ungrouped', () => {
    expect(formatDialNumber('3001')).toBe('3001')
  })

  it('groups seven-digit landlines as 3-4', () => {
    expect(formatDialNumber('6015551')).toBe('601 5551')
  })

  it('groups colombian mobiles as 3-3-4', () => {
    expect(formatDialNumber('3001234567')).toBe('300 123 4567')
  })

  it('keeps numbers beyond ten digits ungrouped', () => {
    expect(formatDialNumber('30012345678')).toBe('30012345678')
  })

  it('formats the +57 country code separately', () => {
    expect(formatDialNumber('+573001234567')).toBe('+57 300 123 4567')
  })

  it('keeps a bare +57 prefix intact', () => {
    expect(formatDialNumber('+57')).toBe('+57')
  })

  it('leaves other country codes untouched', () => {
    expect(formatDialNumber('+13001234567')).toBe('+13001234567')
  })
})
