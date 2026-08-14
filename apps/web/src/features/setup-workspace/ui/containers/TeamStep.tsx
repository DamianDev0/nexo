'use client'

import { useWatch } from 'react-hook-form'

import { useSetupWizard } from '../../model/wizard-context'
import { StepTeam } from '../StepTeam'

export function TeamStep() {
  const { wizard, team } = useSetupWizard()
  const { control, fields } = team
  const values = useWatch({ control, name: 'invites' })

  const invites = fields.map((field, index) => ({ ...(values[index] ?? field), id: field.id }))

  return (
    <StepTeam
      data={invites}
      actions={{ onAdd: team.handleAdd, onRemove: team.handleRemove, onUpdate: team.handleUpdate }}
      nav={{ onNext: team.handleSave, onBack: wizard.prevStep, isPending: team.isPending }}
    />
  )
}
