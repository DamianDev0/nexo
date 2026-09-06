import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import { buildFieldFormSchema } from '@/features/manage-settings/lib/field-form.schema'

const t = ((key: string) => key) as TFunction
const schema = buildFieldFormSchema(t)

const base = {
  label: 'Techo',
  type: 'text',
  required: false,
  showInForm: true,
  options: [],
}

describe('buildFieldFormSchema', () => {
  it('accepts a plain field without options', () => {
    expect(schema.safeParse(base).success).toBe(true)
  })

  it('rejects an empty label', () => {
    const result = schema.safeParse({ ...base, label: '   ' })

    expect(result.success).toBe(false)
  })

  it('rejects option-typed fields without a filled option', () => {
    const result = schema.safeParse({
      ...base,
      type: 'select',
      options: [{ value: '   ' }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['options'])
    }
  })

  it('accepts option-typed fields with at least one filled option', () => {
    const result = schema.safeParse({
      ...base,
      type: 'multiselect',
      options: [{ value: '' }, { value: 'Teja' }],
    })

    expect(result.success).toBe(true)
  })
})
