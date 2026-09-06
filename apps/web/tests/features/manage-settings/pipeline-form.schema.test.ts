import { describe, expect, it, vi } from 'vitest'

import type { TFunction } from 'i18next'

import { PIPELINE_NAME_MAX } from '@/features/manage-settings/config/pipelines.constants'
import { buildPipelineFormSchema } from '@/features/manage-settings/lib/pipeline-form.schema'

const t = vi.fn((key: string) => key) as unknown as TFunction

describe('buildPipelineFormSchema', () => {
  it('accepts a normal name and trims it', () => {
    const result = buildPipelineFormSchema(t).safeParse({ name: '  Ventas B2B  ' })

    expect(result.success).toBe(true)
    expect(result.success && result.data.name).toBe('Ventas B2B')
  })

  it('rejects an empty or whitespace-only name with a localized message', () => {
    const result = buildPipelineFormSchema(t).safeParse({ name: '   ' })

    expect(result.success).toBe(false)
    expect(!result.success && result.error.issues[0]?.message).toBe(
      'settings.optionForm.errors.nameRequired',
    )
  })

  it('rejects names longer than the pipeline max', () => {
    const result = buildPipelineFormSchema(t).safeParse({
      name: 'x'.repeat(PIPELINE_NAME_MAX + 1),
    })

    expect(result.success).toBe(false)
    expect(!result.success && result.error.issues[0]?.message).toBe(
      'settings.optionForm.errors.nameTooLong',
    )
  })
})
