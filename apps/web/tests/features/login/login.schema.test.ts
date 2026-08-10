import { describe, expect, it } from 'vitest'

import { loginSchema } from '@/features/login/lib/login.schema'

const VALID = { email: 'ana@acme.co', password: 'secret1' }

function firstMessage(input: unknown): string | undefined {
  const result = loginSchema.safeParse(input)
  return result.success ? undefined : result.error.issues[0]?.message
}

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse(VALID)
    expect(result.success).toBe(true)
    expect(result.data).toEqual(VALID)
  })

  it('rejects an empty email with the required message', () => {
    expect(firstMessage({ ...VALID, email: '' })).toBe('Email is required')
  })

  it('rejects a malformed email with the format message', () => {
    expect(firstMessage({ ...VALID, email: 'not-an-email' })).toBe('Enter a valid email address')
  })

  it('rejects an empty password with the required message', () => {
    expect(firstMessage({ ...VALID, password: '' })).toBe('Password is required')
  })

  it('rejects a short password with the length message', () => {
    expect(firstMessage({ ...VALID, password: 'abc12' })).toBe(
      'Password must be at least 6 characters',
    )
  })

  it('accepts a password exactly at the 6-character minimum', () => {
    const result = loginSchema.safeParse({ ...VALID, password: 'abcdef' })
    expect(result.success).toBe(true)
  })
})
