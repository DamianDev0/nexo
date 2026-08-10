import { describe, expect, it } from 'vitest'

import { OPTIONAL_STEPS, STEP_KEYS } from '@/features/setup-workspace/config/wizard.constants'
import { buildStepDefs } from '@/features/setup-workspace/lib/wizard-steps'

describe('buildStepDefs', () => {
  it('builds one step def per configured key with translated label and description', () => {
    const t = (key: string) => key

    const result = buildStepDefs(t)

    expect(result).toEqual(
      STEP_KEYS.map((key) => ({
        label: `onboarding.steps.${key}.label`,
        description: `onboarding.steps.${key}.description`,
        optional: OPTIONAL_STEPS.has(key),
      })),
    )
  })

  it('marks nomenclature, navigation, appearance and team as optional and company/pipeline/done as required', () => {
    const result = buildStepDefs((key) => key)

    expect(result.map((step) => step.optional)).toEqual([
      false,
      false,
      true,
      true,
      true,
      true,
      false,
    ])
  })

  it('uses the provided translate function for each label', () => {
    const result = buildStepDefs(() => 'translated')

    expect(result.every((step) => step.label === 'translated')).toBe(true)
    expect(result.every((step) => step.description === 'translated')).toBe(true)
  })
})
