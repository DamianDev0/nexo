import { describe, expect, it } from 'vitest'

import { IMPORT_STEPS } from '@/features/import-contacts/config/import-contacts.constants'
import { buildStepDefs, stepIndex } from '@/features/import-contacts/lib/import-steps'

import type { TFunction } from 'i18next'

const t = ((key: string) => key) as unknown as TFunction

describe('buildStepDefs', () => {
  it('returns one labelled definition per step', () => {
    expect(buildStepDefs(t)).toEqual(
      IMPORT_STEPS.map((step) => ({ label: `contacts.import.stepper.${step}` })),
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
