import { useSetupWizard } from '../../model/wizard-context'
import { StepNomenclature } from '../StepNomenclature'

export function NomenclatureStep() {
  const { wizard, nomenclature } = useSetupWizard()

  return (
    <StepNomenclature
      data={nomenclature.nomen}
      actions={{ onUpdate: nomenclature.handleUpdate, onPreset: nomenclature.handlePreset }}
      nav={{
        onNext: nomenclature.handleSave,
        onBack: wizard.prevStep,
        isPending: nomenclature.isPending,
      }}
    />
  )
}
