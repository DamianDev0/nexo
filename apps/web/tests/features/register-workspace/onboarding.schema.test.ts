import { PlanName } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import { onboardingSchema } from '@/features/register-workspace/lib/onboarding.schema'

const VALID = {
  businessName: 'Acme SAS',
  slug: 'acme-sas',
  planName: PlanName.FREE,
  ownerFullName: 'Ana Torres',
  ownerEmail: 'ana@acme.co',
  ownerPassword: 'Secret123',
}

function firstMessage(input: unknown): string | undefined {
  const result = onboardingSchema.safeParse(input)
  return result.success ? undefined : result.error.issues[0]?.message
}

describe('onboardingSchema', () => {
  it('accepts a fully valid onboarding payload', () => {
    const result = onboardingSchema.safeParse(VALID)
    expect(result.success).toBe(true)
    expect(result.data).toEqual(VALID)
  })

  it('rejects an empty business name with the required message', () => {
    expect(firstMessage({ ...VALID, businessName: '' })).toBe('Business name is required')
  })

  it('rejects a one-character business name with the length message', () => {
    expect(firstMessage({ ...VALID, businessName: 'A' })).toBe('At least 2 characters')
  })

  it('rejects an empty slug with the required message', () => {
    expect(firstMessage({ ...VALID, slug: '' })).toBe('Slug is required')
  })

  it('rejects a slug with uppercase or invalid characters with the format message', () => {
    expect(firstMessage({ ...VALID, slug: 'Acme SAS!' })).toBe(
      'Only lowercase letters, numbers, and inner hyphens',
    )
  })

  it('rejects a plan name outside the PlanName enum', () => {
    const result = onboardingSchema.safeParse({ ...VALID, planName: 'ENTERPRISE_PLUS' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty owner full name with the required message', () => {
    expect(firstMessage({ ...VALID, ownerFullName: '' })).toBe('Full name is required')
  })

  it('rejects an empty owner email with the required message', () => {
    expect(firstMessage({ ...VALID, ownerEmail: '' })).toBe('Email is required')
  })

  it('rejects a malformed owner email with the format message', () => {
    expect(firstMessage({ ...VALID, ownerEmail: 'not-an-email' })).toBe('Enter a valid email')
  })

  it('rejects an empty owner password with the required message', () => {
    expect(firstMessage({ ...VALID, ownerPassword: '' })).toBe('Password is required')
  })

  it('rejects a short owner password with the length message', () => {
    expect(firstMessage({ ...VALID, ownerPassword: 'Ab1' })).toBe('At least 8 characters')
  })

  it('rejects an owner password missing case or digit variety with the strength message', () => {
    expect(firstMessage({ ...VALID, ownerPassword: 'alllowercase' })).toBe(
      'Include lowercase, uppercase, and a number',
    )
  })
})
