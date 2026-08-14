'use client'

import { useWatch } from 'react-hook-form'

import { useSetupWizard } from '../../model/wizard-context'
import { StepNavigation } from '../StepNavigation'

export function NavigationStep() {
  const { wizard, navigation } = useSetupWizard()
  const modules = useWatch({ control: navigation.control, name: 'modules' })

  return (
    <StepNavigation
      data={modules}
      actions={{ onToggle: navigation.handleToggle, onReorder: navigation.handleReorder }}
      nav={{
        onNext: navigation.handleSave,
        onBack: wizard.prevStep,
        isPending: navigation.isPending,
      }}
    />
  )
}
