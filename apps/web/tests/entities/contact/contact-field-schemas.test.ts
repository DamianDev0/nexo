import { describe, expect, it } from 'vitest'

import {
  optionalEmailSchema,
  optionalPhoneSchema,
} from '@/entities/contact/lib/contact-field-schemas'

const t = ((key: string) => key) as never

describe('optionalPhoneSchema', () => {
  const schema = optionalPhoneSchema(t)

  it('accepts empty and normalises a valid Colombian mobile to digits', () => {
    expect(schema.safeParse('').success).toBe(true)
    const parsed = schema.safeParse('+57 300 123 4567')
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data).toBe('3001234567')
  })

  it('rejects an invalid number', () => {
    expect(schema.safeParse('12').success).toBe(false)
  })
})

describe('optionalEmailSchema', () => {
  const schema = optionalEmailSchema(t)

  it('accepts empty or a valid email and rejects garbage', () => {
    expect(schema.safeParse('').success).toBe(true)
    expect(schema.safeParse('ana@nexo.co').success).toBe(true)
    expect(schema.safeParse('nope').success).toBe(false)
  })
})
