import { describe, expect, it } from 'vitest'

import { buildViewFormSchema } from '@/features/manage-contact-views/lib/view-form.schema'

const schema = buildViewFormSchema((key) => key)

describe('buildViewFormSchema', () => {
  it('requires a non-empty trimmed name', () => {
    expect(schema.safeParse({ name: '  ', description: '' }).success).toBe(false)
    expect(schema.safeParse({ name: 'VIP', description: '' }).success).toBe(true)
  })

  it('caps name and description lengths', () => {
    expect(schema.safeParse({ name: 'a'.repeat(121), description: '' }).success).toBe(false)
    expect(schema.safeParse({ name: 'ok', description: 'b'.repeat(301) }).success).toBe(false)
  })
})
