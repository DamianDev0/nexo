'use client'

import { useWatch } from 'react-hook-form'

import { useSetupWizard } from '../../model/wizard-context'
import { StepNomenclature } from '../StepNomenclature'

export function NomenclatureStep() {
  const { wizard, nomenclature } = useSetupWizard()
  const [contact, company, deal, activity] = useWatch({
    control: nomenclature.control,
    name: ['contact', 'company', 'deal', 'activity'],
  })
  const nomen = { contact, company, deal, activity }

  return (
    <StepNomenclature
      data={nomen}
      actions={{ onUpdate: nomenclature.handleUpdate, onPreset: nomenclature.handlePreset }}
      nav={{
        onNext: nomenclature.handleSave,
        onBack: wizard.prevStep,
        isPending: nomenclature.isPending,
      }}
    />
  )
}
