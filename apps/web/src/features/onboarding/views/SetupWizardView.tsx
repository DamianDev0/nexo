'use client'

import { useCallback } from 'react'
import { useOnboardingWizard } from '../hooks/useOnboardingWizard'
import { useStepCompany } from '../hooks/useStepCompany'
import { useStepPipeline } from '../hooks/useStepPipeline'
import { useStepNomenclature } from '../hooks/useStepNomenclature'
import { useStepNavigation } from '../hooks/useStepNavigation'
import { useStepAppearance } from '../hooks/useStepAppearance'
import { useStepTeam } from '../hooks/useStepTeam'
import { WizardLayout } from '../components/WizardLayout'
import { StepCompany } from '../components/StepCompany'
import { StepPipeline } from '../components/StepPipeline'
import { StepNomenclature } from '../components/StepNomenclature'
import { StepNavigation } from '../components/StepNavigation'
import { StepAppearance } from '../components/StepAppearance'
import { StepTeam } from '../components/StepTeam'
import { StepDone } from '../components/StepDone'

const STEPS = [
  { label: 'Your company', description: 'Basic info' },
  { label: 'Sales pipeline', description: 'Stages & probabilities' },
  { label: 'Nomenclature', description: 'Entity names', optional: true },
  { label: 'Navigation', description: 'Sidebar modules', optional: true },
  { label: 'Appearance', description: 'Theme & colors', optional: true },
  { label: 'Invite team', description: 'Colleagues & roles', optional: true },
  { label: 'Done!', description: 'Go to dashboard' },
] as const

export function SetupWizardView() {
  const wizard = useOnboardingWizard()
  const company = useStepCompany(wizard.nextStep)
  const pipeline = useStepPipeline(wizard.nextStep)
  const nomenclature = useStepNomenclature(wizard.nextStep)
  const navigation = useStepNavigation(wizard.nextStep)
  const appearance = useStepAppearance(wizard.nextStep)
  const team = useStepTeam(wizard.nextStep)

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
          sector={company.sector}
          isPending={company.isPending}
          onPhoneChange={company.setPhone}
          onWebsiteChange={company.setWebsite}
          onSectorChange={company.setSector}
          onNext={company.handleSave}
        />
      )}
      {wizard.currentStep === 2 && (
        <StepPipeline
          pipelineName={pipeline.pipelineName}
          stages={pipeline.stages}
          isPending={pipeline.isPending}
          onPipelineNameChange={pipeline.setPipelineName}
          onAddStage={pipeline.handleAddStage}
          onRemoveStage={pipeline.handleRemoveStage}
          onUpdateStage={pipeline.handleUpdateStage}
          onNext={pipeline.handleSave}
          onBack={wizard.prevStep}
        />
      )}
      {wizard.currentStep === 3 && (
        <StepNomenclature
          nomen={nomenclature.nomen}
          isPending={nomenclature.isPending}
          onUpdate={nomenclature.handleUpdate}
          onPreset={nomenclature.handlePreset}
          onNext={nomenclature.handleSave}
          onBack={wizard.prevStep}
        />
      )}
      {wizard.currentStep === 4 && (
        <StepNavigation
          modules={navigation.modules}
          isPending={navigation.isPending}
          onToggle={navigation.handleToggle}
          onReorder={navigation.handleReorder}
          onNext={navigation.handleSave}
          onBack={wizard.prevStep}
        />
      )}
      {wizard.currentStep === 5 && (
        <StepAppearance
          primaryColor={appearance.primaryColor}
          colors={appearance.colors}
          grainIntensity={appearance.grainIntensity}
          darkMode={appearance.darkMode}
          fontFamily={appearance.fontFamily}
          borderRadius={appearance.borderRadius}
          density={appearance.density}
          productName={appearance.productName}
          tagline={appearance.tagline}
          logoPreview={appearance.logoPreview}
          navModules={navigation.modules}
          logoFileName={appearance.logoFileName}
          isPending={appearance.isPending}
          onPrimaryColorChange={appearance.handlePrimaryChange}
          onColorOverride={appearance.handleColorOverride}
          onGrainIntensityChange={appearance.setGrainIntensity}
          onDarkModeChange={appearance.setDarkMode}
          onFontFamilyChange={appearance.setFontFamily}
          onBorderRadiusChange={appearance.setBorderRadius}
          onDensityChange={appearance.setDensity}
          onProductNameChange={appearance.setProductName}
          onTaglineChange={appearance.setTagline}
          onLogoUpload={appearance.handleLogoUpload}
          onLogoRemove={appearance.handleLogoRemove}
          onRestoreTheme={appearance.handleRestoreTheme}
          onNext={appearance.handleSave}
          onBack={wizard.prevStep}
        />
      )}
      {wizard.currentStep === 6 && (
        <StepTeam
          invites={team.invites}
          isPending={team.isPending}
          onAdd={team.handleAdd}
          onRemove={team.handleRemove}
          onUpdate={team.handleUpdate}
          onNext={team.handleSave}
          onBack={wizard.prevStep}
        />
      )}
      {wizard.currentStep === 7 && (
        <StepDone onGoToDashboard={wizard.completeOnboarding} onReviewConfig={handleReview} />
      )}
    </WizardLayout>
  )
}
