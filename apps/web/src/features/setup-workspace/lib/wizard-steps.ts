import { OPTIONAL_STEPS, STEP_KEYS } from '../config/wizard.constants'

import type { StepDef } from '../ui/WizardLayout'

export function buildStepDefs(t: (key: string) => string): StepDef[] {
  return STEP_KEYS.map((key) => ({
    label: t(`onboarding.steps.${key}.label`),
    description: t(`onboarding.steps.${key}.description`),
    optional: OPTIONAL_STEPS.has(key),
  }))
}
