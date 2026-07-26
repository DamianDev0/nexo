import { STAGE_COLOR_OPTIONS } from '@repo/shared-utils'
import { t } from 'i18next'
import { useCallback } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import settingsService from '@/shared/api/services/settings.service'

import { useStepMutation } from './useStepMutation'

interface Stage {
  name: string
  color: string
  probability: number
}

interface PipelineFormValues {
  pipelineName: string
  stages: Stage[]
}

const DEFAULT_VALUES: PipelineFormValues = {
  pipelineName: 'Sales Pipeline',
  stages: [
    { name: 'MQL', color: STAGE_COLOR_OPTIONS[0], probability: 10 },
    { name: 'SQL', color: STAGE_COLOR_OPTIONS[1], probability: 25 },
    { name: 'Demo Scheduled', color: STAGE_COLOR_OPTIONS[3], probability: 40 },
    { name: 'Proposal', color: STAGE_COLOR_OPTIONS[4], probability: 60 },
    { name: 'Negotiation', color: STAGE_COLOR_OPTIONS[5], probability: 80 },
    { name: 'Closed Won', color: STAGE_COLOR_OPTIONS[6], probability: 100 },
  ],
}

function newStage(): Stage {
  return { name: 'New Stage', color: STAGE_COLOR_OPTIONS[9], probability: 50 }
}

export function useStepPipeline(onNext: () => void) {
  const { control, watch, setValue, getValues } = useForm<PipelineFormValues>({
    defaultValues: DEFAULT_VALUES,
  })
  const { fields, append, remove, update } = useFieldArray({ control, name: 'stages' })
  const watchedStages = watch('stages')

  const stages = fields.map((field, index) => ({
    ...(watchedStages[index] ?? field),
    id: field.id,
  }))

  const indexOf = useCallback((id: string) => fields.findIndex((f) => f.id === id), [fields])

  const handleAddStage = useCallback(() => append(newStage()), [append])

  const handleRemoveStage = useCallback(
    (id: string) => {
      const index = indexOf(id)
      if (index >= 0) remove(index)
    },
    [indexOf, remove],
  )

  const handleUpdateStage = useCallback(
    (id: string, patch: Partial<Stage>) => {
      const index = indexOf(id)
      if (index < 0) return
      update(index, { ...getValues(`stages.${index}`), ...patch })
    },
    [indexOf, update, getValues],
  )

  const { handleSave, isPending } = useStepMutation({
    mutationFn: () => {
      const form = getValues()
      return settingsService.createPipeline({
        name: form.pipelineName,
        isDefault: true,
        stages: form.stages.map((s) => ({
          name: s.name,
          color: s.color,
          probability: s.probability,
        })),
      })
    },
    onNext,
    errorTitle: t('auth.toasts.pipelineFailed'),
  })

  return {
    pipelineName: watch('pipelineName'),
    setPipelineName: (v: string) => setValue('pipelineName', v),
    stages,
    handleAddStage,
    handleRemoveStage,
    handleUpdateStage,
    handleSave,
    isPending,
  }
}
