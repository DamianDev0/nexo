import { formatCOPhone, isMobileCOPhone, isValidCOPhone, phoneDigits } from '../phone-co'

describe('phoneDigits', () => {
  it('keeps only digits and caps the length at ten', () => {
    expect(phoneDigits('300-123-4567')).toBe('3001234567')
  })
})

describe('phoneDigits with a country code', () => {
  it('drops a leading +57 so a pasted international number still fits', () => {
    expect(phoneDigits('+57 300 123 4567')).toBe('3001234567')
  })

  it('keeps a national number that merely starts with 57', () => {
    expect(phoneDigits('5712345678')).toBe('5712345678')
  })
})

describe('isValidCOPhone', () => {
  it('accepts a mobile number', () => {
    expect(isValidCOPhone('300 123 4567')).toBe(true)
  })

  it('accepts a landline on the national ten digit plan', () => {
    expect(isValidCOPhone('601 234 5678')).toBe(true)
  })

  it('rejects a number that is too short', () => {
    expect(isValidCOPhone('300 123 456')).toBe(false)
  })

  it('rejects a prefix that belongs to no Colombian plan', () => {
    expect(isValidCOPhone('123 456 7890')).toBe(false)
  })
})

describe('isMobileCOPhone', () => {
  it('separates mobile from landline', () => {
    expect(isMobileCOPhone('3001234567')).toBe(true)
    expect(isMobileCOPhone('6012345678')).toBe(false)
  })
})

describe('formatCOPhone', () => {
  it('groups the digits as they are typed', () => {
    expect(formatCOPhone('300')).toBe('300')
    expect(formatCOPhone('300123')).toBe('300 123')
    expect(formatCOPhone('3001234567')).toBe('300 123 4567')
  })
})
