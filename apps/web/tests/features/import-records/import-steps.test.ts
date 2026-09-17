import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import { IMPORT_STEPS } from '@/features/import-records/config/import.constants'
import { buildStepDefs, stepIndex } from '@/features/import-records/lib/import-steps'

const t = ((key: string) => key) as unknown as TFunction

describe('buildStepDefs', () => {
  it('returns one labelled definition per step', () => {
    expect(buildStepDefs(t)).toEqual(
      IMPORT_STEPS.map((step) => ({ label: `imports.stepper.${step}` })),
    )
  })
})

describe('stepIndex', () => {
  it('resolves the position of each step', () => {
    IMPORT_STEPS.forEach((step, index) => {
      expect(stepIndex(step)).toBe(index)
    })
  })
})
