import { useSetupWizard } from '../../model/wizard-context'
import { StepTeam } from '../StepTeam'

export function TeamStep() {
  const { wizard, team } = useSetupWizard()

  return (
    <StepTeam
      data={team.invites}
      actions={{ onAdd: team.handleAdd, onRemove: team.handleRemove, onUpdate: team.handleUpdate }}
      nav={{ onNext: team.handleSave, onBack: wizard.prevStep, isPending: team.isPending }}
    />
  )
}
