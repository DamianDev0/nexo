import { TAXONOMY_DESCRIPTION_MAX } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import {
  buildOptionFormSchema,
  buildReassignSchema,
} from '@/features/manage-settings/lib/option-form.schema'

const t = ((key: string) => key) as unknown as TFunction

const optionSchema = buildOptionFormSchema(t)
const reassignSchema = buildReassignSchema(t)

describe('buildOptionFormSchema', () => {
  it('trims name and description', () => {
    const parsed = optionSchema.parse({ name: '  VIP  ', description: '  Alto valor  ' })

    expect(parsed).toEqual({ name: 'VIP', description: 'Alto valor' })
  })

  it('rejects a name that is blank after trimming', () => {
    const result = optionSchema.safeParse({ name: '   ', description: '' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('settings.optionForm.errors.nameRequired')
  })

  it('rejects a name over 100 characters', () => {
    const result = optionSchema.safeParse({ name: 'x'.repeat(101), description: '' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('settings.optionForm.errors.nameTooLong')
  })

  it('accepts a name of exactly 100 characters', () => {
    expect(optionSchema.safeParse({ name: 'x'.repeat(100), description: '' }).success).toBe(true)
  })

  it('rejects a description over the shared maximum', () => {
    const result = optionSchema.safeParse({
      name: 'VIP',
      description: 'x'.repeat(TAXONOMY_DESCRIPTION_MAX + 1),
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('settings.optionForm.errors.descriptionTooLong')
  })

  it('accepts an empty description', () => {
    expect(optionSchema.safeParse({ name: 'VIP', description: '' }).success).toBe(true)
  })
})

describe('buildReassignSchema', () => {
  it('requires a target', () => {
    const result = reassignSchema.safeParse({ target: '' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('settings.reassign.errors.targetRequired')
  })

  it('accepts a chosen target', () => {
    expect(reassignSchema.safeParse({ target: 'client' })).toMatchObject({ success: true })
  })
})
