import { useSetupWizard } from '../../model/wizard-context'
import { StepNavigation } from '../StepNavigation'

export function NavigationStep() {
  const { wizard, navigation } = useSetupWizard()

  return (
    <StepNavigation
      data={navigation.modules}
      actions={{ onToggle: navigation.handleToggle, onReorder: navigation.handleReorder }}
      nav={{
        onNext: navigation.handleSave,
        onBack: wizard.prevStep,
        isPending: navigation.isPending,
      }}
    />
  )
}
