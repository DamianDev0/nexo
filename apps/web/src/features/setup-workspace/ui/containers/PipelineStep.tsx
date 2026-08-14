'use client'

import { useWatch } from 'react-hook-form'

import { useSetupWizard } from '../../model/wizard-context'
import { StepPipeline } from '../StepPipeline'

export function PipelineStep() {
  const { wizard, pipeline } = useSetupWizard()
  const { control, fields, bindField } = pipeline
  const pipelineName = useWatch({ control, name: 'pipelineName' })
  const values = useWatch({ control, name: 'stages' })

  const stages = fields.map((field, index) => ({ ...(values[index] ?? field), id: field.id }))

  return (
    <StepPipeline
      data={{ pipelineName, stages }}
      actions={{
        onNameChange: bindField('pipelineName'),
        onAddStage: pipeline.handleAddStage,
        onRemoveStage: pipeline.handleRemoveStage,
        onUpdateStage: pipeline.handleUpdateStage,
        onReorderStages: pipeline.handleReorderStages,
      }}
      nav={{ onNext: pipeline.handleSave, onBack: wizard.prevStep, isPending: pipeline.isPending }}
    />
  )
}
