import { describe, expect, it, vi } from 'vitest'

import type { TFunction } from 'i18next'

import { OPTION_NAME_MAX } from '@/features/manage-settings/config/option-form.constants'
import { buildActivityTypeFormSchema } from '@/features/manage-settings/lib/activity-type-form.schema'


const t = vi.fn((key: string) => key) as unknown as TFunction

const VALID = { label: 'Llamada', icon: 'phone', color: '#84cc16', trackDuration: false }

describe('buildActivityTypeFormSchema', () => {
  it('accepts a complete activity type and trims the label', () => {
    const result = buildActivityTypeFormSchema(t).safeParse({ ...VALID, label: ' Llamada ' })

    expect(result.success).toBe(true)
    expect(result.success && result.data.label).toBe('Llamada')
  })

  it('rejects an empty label with a localized message', () => {
    const result = buildActivityTypeFormSchema(t).safeParse({ ...VALID, label: '  ' })

    expect(result.success).toBe(false)
    expect(!result.success && result.error.issues[0]?.message).toBe(
      'settings.optionForm.errors.nameRequired',
    )
  })

  it('rejects labels longer than the option name max', () => {
    const result = buildActivityTypeFormSchema(t).safeParse({
      ...VALID,
      label: 'x'.repeat(OPTION_NAME_MAX + 1),
    })

    expect(result.success).toBe(false)
  })

  it('requires icon and color', () => {
    expect(buildActivityTypeFormSchema(t).safeParse({ ...VALID, icon: '' }).success).toBe(false)
    expect(buildActivityTypeFormSchema(t).safeParse({ ...VALID, color: '' }).success).toBe(false)
  })
})
