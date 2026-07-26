import type { StepDef } from '../ui/WizardLayout'

export const STEP_KEYS = [
  'company',
  'pipeline',
  'nomenclature',
  'navigation',
  'appearance',
  'team',
  'done',
] as const

export type StepKey = (typeof STEP_KEYS)[number]

const OPTIONAL_STEPS: ReadonlySet<StepKey> = new Set([
  'nomenclature',
  'navigation',
  'appearance',
  'team',
])

export function buildStepDefs(t: (key: string) => string): StepDef[] {
  return STEP_KEYS.map((key) => ({
    label: t(`onboarding.steps.${key}.label`),
    description: t(`onboarding.steps.${key}.description`),
    optional: OPTIONAL_STEPS.has(key),
  }))
}
