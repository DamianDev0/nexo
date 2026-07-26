import { useSetupWizard } from '../../model/wizard-context'
import { StepPipeline } from '../StepPipeline'

export function PipelineStep() {
  const { wizard, pipeline } = useSetupWizard()

  return (
    <StepPipeline
      data={{ pipelineName: pipeline.pipelineName, stages: pipeline.stages }}
      actions={{
        onNameChange: pipeline.setPipelineName,
        onAddStage: pipeline.handleAddStage,
        onRemoveStage: pipeline.handleRemoveStage,
        onUpdateStage: pipeline.handleUpdateStage,
      }}
      nav={{ onNext: pipeline.handleSave, onBack: wizard.prevStep, isPending: pipeline.isPending }}
    />
  )
}
