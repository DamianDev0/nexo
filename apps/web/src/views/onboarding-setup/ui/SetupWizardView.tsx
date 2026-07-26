'use client'

import { useTranslation } from 'react-i18next'

import {
  AppearanceStep,
  CompanyStep,
  DoneStep,
  NavigationStep,
  NomenclatureStep,
  PipelineStep,
  SetupWizardProvider,
  TeamStep,
  WizardLayout,
  buildStepDefs,
  useSetupWizard,
} from '@/features/setup-workspace'

const STEP_CONTENT = [
  CompanyStep,
  PipelineStep,
  NomenclatureStep,
  NavigationStep,
  AppearanceStep,
  TeamStep,
  DoneStep,
] as const

function WizardShell() {
  const { t } = useTranslation()
  const { wizard } = useSetupWizard()

  const CurrentStep = STEP_CONTENT[wizard.currentStep - 1] ?? CompanyStep

  return (
    <WizardLayout
      rail={{
        steps: buildStepDefs(t),
        currentStep: wizard.currentStep,
        progressPercent: wizard.progressPercent,
        onStepClick: wizard.goToStep,
        onSkip: wizard.skipSetup,
      }}
    >
      <CurrentStep />
    </WizardLayout>
  )
}

export function SetupWizardView() {
  return (
    <SetupWizardProvider>
      <WizardShell />
    </SetupWizardProvider>
  )
}
