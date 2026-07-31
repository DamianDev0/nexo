import type { StepKey } from '../model/types'

export const STEP_KEYS: ReadonlyArray<StepKey> = [
  'company',
  'pipeline',
  'nomenclature',
  'navigation',
  'appearance',
  'team',
  'done',
]

export const OPTIONAL_STEPS: ReadonlySet<StepKey> = new Set([
  'nomenclature',
  'navigation',
  'appearance',
  'team',
])
