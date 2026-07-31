import { STAGE_COLOR_OPTIONS } from '@repo/shared-utils'
import { t } from 'i18next'
import { useCallback, useRef } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { createPipelineAction } from '../api/setup-steps.actions'
import { useStepHydration } from '../query/useStepHydration'
import { useStepMutation } from '../query/useStepMutation'

import type { Pipeline } from '@repo/shared-types'

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
  const {
    control,
    watch,
    setValue,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<PipelineFormValues>({
    defaultValues: DEFAULT_VALUES,
  })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'stages' })
  const existingPipelineId = useRef<string | null>(null)

  useStepHydration({
    queryKey: QUERY_KEYS.settings.pipelines,
    queryFn: settingsService.getPipelines,
    hydrate: useCallback(
      (pipelines: Pipeline[]) => {
        const existing = pipelines.find((p) => p.isDefault) ?? pipelines[0]
        if (!existing) return
        existingPipelineId.current = existing.id
        reset({
          pipelineName: existing.name,
          stages: [...existing.stages]
            .sort((a, b) => a.position - b.position)
            .map(({ name, color, probability }) => ({ name, color, probability })),
        })
      },
      [reset],
    ),
  })
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
      if (patch.name !== undefined)
        setValue(`stages.${index}.name`, patch.name, { shouldDirty: true })
      if (patch.color !== undefined)
        setValue(`stages.${index}.color`, patch.color, { shouldDirty: true })
      if (patch.probability !== undefined)
        setValue(`stages.${index}.probability`, patch.probability, { shouldDirty: true })
    },
    [indexOf, setValue],
  )

  const handleReorderStages = useCallback(
    (activeId: string, overId: string) => {
      const from = indexOf(activeId)
      const to = indexOf(overId)
      if (from >= 0 && to >= 0 && from !== to) move(from, to)
    },
    [indexOf, move],
  )

  const { handleSave, isPending } = useStepMutation({
    mutationFn: async () => {
      if (existingPipelineId.current && !isDirty) return null
      const form = getValues()
      const result = await createPipelineAction({
        name: form.pipelineName,
        stages: form.stages.map((s) => ({
          name: s.name,
          color: s.color,
          probability: s.probability,
        })),
      })
      if (!result.ok) throw new Error(result.error)
      return result.data
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
    handleReorderStages,
    handleSave,
    isPending,
  }
}
