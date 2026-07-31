export type StepKey =
  | 'company'
  | 'pipeline'
  | 'nomenclature'
  | 'navigation'
  | 'appearance'
  | 'team'
  | 'done'

export interface StepDef {
  readonly label: string
  readonly description: string
  readonly optional?: boolean
}

export interface WizardRail {
  readonly steps: ReadonlyArray<StepDef>
  readonly currentStep: number
  readonly progressPercent: number
  readonly onStepClick: (step: number) => void
  readonly onSkip: () => void
}
