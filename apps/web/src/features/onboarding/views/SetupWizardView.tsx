'use client'

import { useCallback } from 'react'
import { useOnboardingWizard } from '../hooks/useOnboardingWizard'
import { useStepCompany } from '../hooks/useStepCompany'
import { useStepAppearance } from '../hooks/useStepAppearance'
import { WizardLayout } from '../components/WizardLayout'
import { StepCompany } from '../components/StepCompany'
import { StepPipeline } from '../components/StepPipeline'
import { StepNomenclature } from '../components/StepNomenclature'
import { StepAppearance } from '../components/StepAppearance'
import { StepTeam } from '../components/StepTeam'
import { StepDone } from '../components/StepDone'

const STEPS = [
  { label: 'Your company', description: 'Basic info' },
  { label: 'Sales pipeline', description: 'Stages & probabilities' },
  { label: 'Nomenclature', description: 'Entity names', optional: true },
  { label: 'Appearance', description: 'Theme & colors', optional: true },
  { label: 'Invite team', description: 'Colleagues & roles', optional: true },
  { label: 'Done!', description: 'Go to dashboard' },
] as const

export function SetupWizardView() {
  const wizard = useOnboardingWizard()
  const company = useStepCompany(wizard.nextStep)
  const appearance = useStepAppearance(wizard.nextStep)

  const handleReview = useCallback(() => wizard.goToStep(1), [wizard])

  return (
    <WizardLayout
      steps={STEPS}
      currentStep={wizard.currentStep}
      progressPercent={wizard.progressPercent}
      onStepClick={wizard.goToStep}
      onSkip={wizard.skipSetup}
    >
      {wizard.currentStep === 1 && (
        <StepCompany
          phone={company.phone}
          website={company.website}
          timezone={company.timezone}
          currency={company.currency}
          sector={company.sector}
          isPending={company.isPending}
          onPhoneChange={company.setPhone}
          onWebsiteChange={company.setWebsite}
          onTimezoneChange={company.setTimezone}
          onCurrencyChange={company.setCurrency}
          onSectorChange={company.setSector}
          onNext={company.handleSave}
        />
      )}
      {wizard.currentStep === 2 && (
        <StepPipeline onNext={wizard.nextStep} onBack={wizard.prevStep} />
      )}
      {wizard.currentStep === 3 && (
        <StepNomenclature onNext={wizard.nextStep} onBack={wizard.prevStep} />
      )}
      {wizard.currentStep === 4 && (
        <StepAppearance
          primaryColor={appearance.primaryColor}
          darkMode={appearance.darkMode}
          productName={appearance.productName}
          tagline={appearance.tagline}
          isPending={appearance.isPending}
          onPrimaryColorChange={appearance.setPrimaryColor}
          onDarkModeChange={appearance.setDarkMode}
          onProductNameChange={appearance.setProductName}
          onTaglineChange={appearance.setTagline}
          onNext={appearance.handleSave}
          onBack={wizard.prevStep}
        />
      )}
      {wizard.currentStep === 5 && <StepTeam onNext={wizard.nextStep} onBack={wizard.prevStep} />}
      {wizard.currentStep === 6 && (
        <StepDone onGoToDashboard={wizard.completeOnboarding} onReviewConfig={handleReview} />
      )}
    </WizardLayout>
  )
}
