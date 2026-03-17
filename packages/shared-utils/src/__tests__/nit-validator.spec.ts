import { calculateCheckDigit, validateNIT, formatNIT, stripNIT } from '../nit-validator'

// ─── calculateCheckDigit ──────────────────────────────────────────────────────

describe('calculateCheckDigit', () => {
  it('returns the correct DV for known NITs', () => {
    // Real Colombian company NITs with verified check digits (DIAN mod-11 algorithm)
    expect(calculateCheckDigit('900123456')).toBe('8') // DV=8
    expect(calculateCheckDigit('800197268')).toBe('4') // DIAN NIT (well-known), DV=4
    expect(calculateCheckDigit('860002534')).toBe('0') // DV=0 (remainder=0 edge case)
    expect(calculateCheckDigit('900775106')).toBe('2') // DV=2
  })

  it('returns "0" when remainder is 0 (edge case)', () => {
    // 860002534 → remainder=0 → DV='0'
    expect(calculateCheckDigit('860002534')).toBe('0')
  })

  it('always returns a single digit string', () => {
    const dv = calculateCheckDigit('900123456')
    expect(typeof dv).toBe('string')
    expect(dv).toHaveLength(1)
  })

  it('is deterministic — same input always gives same result', () => {
    const nit = '900123456'
    expect(calculateCheckDigit(nit)).toBe(calculateCheckDigit(nit))
  })
})

// ─── validateNIT ─────────────────────────────────────────────────────────────

describe('validateNIT', () => {
  // ─── Valid inputs ────────────────────────────────────────────────────────

  it('validates a plain 9-digit NIT (no check digit)', () => {
    const result = validateNIT('900123456')

    expect(result.isValid).toBe(true)
    expect(result.nit).toBe('900123456')
    expect(result.checkDigit).toBe('8')
    expect(result.formatted).toBe('900.123.456-8')
  })

  it('validates a formatted NIT "900.123.456-8"', () => {
    const result = validateNIT('900.123.456-8')

    expect(result.isValid).toBe(true)
    expect(result.nit).toBe('900123456')
    expect(result.checkDigit).toBe('8')
  })

  it('validates a 10-digit NIT with embedded check digit "9001234568"', () => {
    const result = validateNIT('9001234568')

    expect(result.isValid).toBe(true)
    expect(result.nit).toBe('900123456')
    expect(result.checkDigit).toBe('8')
  })

  it('validates a NIT with spaces "900 123 456"', () => {
    const result = validateNIT('900 123 456')

    expect(result.isValid).toBe(true)
    expect(result.nit).toBe('900123456')
  })

  it('validates a NIT without separator "900123456-8"', () => {
    const result = validateNIT('900123456-8')

    expect(result.isValid).toBe(true)
    expect(result.nit).toBe('900123456')
    expect(result.checkDigit).toBe('8')
  })

  // ─── Invalid inputs ──────────────────────────────────────────────────────

  it('returns isValid: false for wrong check digit', () => {
    // "9001234567" — DV should be 8, not 7
    const result = validateNIT('9001234567')

    expect(result.isValid).toBe(false)
    expect(result.nit).toBeUndefined()
  })

  it('returns isValid: false for too short input', () => {
    expect(validateNIT('12345').isValid).toBe(false)
    expect(validateNIT('1234567').isValid).toBe(false)
  })

  it('returns isValid: false for too long input', () => {
    expect(validateNIT('90012345678').isValid).toBe(false)
  })

  it('returns isValid: false for non-numeric input', () => {
    expect(validateNIT('ABCDEFGHI').isValid).toBe(false)
    expect(validateNIT('').isValid).toBe(false)
  })

  it('does not mutate the input string', () => {
    const input = '900.123.456-7'
    validateNIT(input)
    expect(input).toBe('900.123.456-7')
  })
})

// ─── formatNIT ────────────────────────────────────────────────────────────────

describe('formatNIT', () => {
  it('formats a 9-digit NIT with check digit', () => {
    expect(formatNIT('900123456', '8')).toBe('900.123.456-8')
  })

  it('formats a 9-digit NIT with groups of 3', () => {
    expect(formatNIT('800197268', '4')).toBe('800.197.268-4')
  })

  it('handles NITs with leading zeros in parts', () => {
    const result = formatNIT('100200300', '0')
    expect(result).toMatch(/^\d{1,3}\.\d{3}\.\d{3}-\d$/)
  })

  it('appends the check digit after a hyphen', () => {
    const result = formatNIT('900123456', '8')
    expect(result).toContain('-8')
    expect(result.endsWith('-8')).toBe(true)
  })
})

// ─── stripNIT ─────────────────────────────────────────────────────────────────

describe('stripNIT', () => {
  it('strips formatting from "900.123.456-7" → "900123456"', () => {
    expect(stripNIT('900.123.456-7')).toBe('900123456')
  })

  it('strips a 10-digit NIT → 9-digit base', () => {
    expect(stripNIT('9001234567')).toBe('900123456')
  })

  it('returns plain 9-digit NIT unchanged', () => {
    expect(stripNIT('900123456')).toBe('900123456')
  })

  it('strips spaces', () => {
    expect(stripNIT('900 123 456')).toBe('900123456')
  })
})

// ─── Round-trip ───────────────────────────────────────────────────────────────

describe('round-trip: validateNIT → formatNIT → stripNIT', () => {
  const nits = ['900123456', '800197268', '860002534', '900775106']

  it.each(nits)('round-trips correctly for NIT %s', (nit) => {
    const validated = validateNIT(nit)
    expect(validated.isValid).toBe(true)

    if (!validated.nit || !validated.checkDigit) throw new Error('Expected valid NIT')
    const formatted = formatNIT(validated.nit, validated.checkDigit)
    const stripped = stripNIT(formatted)

    expect(stripped).toBe(nit)
  })
})
