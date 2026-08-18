import { IMPORT_STEPS } from '../config/import-contacts.constants'

import type { ImportStep } from '../model/types/import.types'
import type { TFunction } from 'i18next'

export function buildStepDefs(t: TFunction): Array<{ label: string }> {
  return IMPORT_STEPS.map((step) => ({ label: t(`contacts.import.stepper.${step}`) }))
}

export function stepIndex(current: ImportStep): number {
  return IMPORT_STEPS.indexOf(current)
}
