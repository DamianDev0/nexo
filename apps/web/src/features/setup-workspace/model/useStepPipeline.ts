import { t } from 'i18next'
import { useCallback, useMemo, useRef } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import settingsService from '@/shared/api/services/settings.service'
import { useFormFields } from '@/shared/lib/hooks/useFormFields'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { createPipelineAction } from '../api/setup-steps.actions'
import { PIPELINE_DEFAULT_VALUES, PIPELINE_STAGE_DEFAULT } from '../config/pipeline.constants'
import { useStepHydration } from '../query/useStepHydration'
import { useStepMutation } from '../query/useStepMutation'

import type { PipelineFormValues, Stage } from './types'
import type { Pipeline } from '@repo/shared-types'

export function useStepPipeline(onNext: () => void) {
  const {
    control,
    setValue,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<PipelineFormValues>({ defaultValues: PIPELINE_DEFAULT_VALUES })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'stages' })
  const { setField, bindField } = useFormFields(setValue)
  const existingPipelineId = useRef<string | null>(null)

  useStepHydration({
    queryKey: QUERY_KEYS.settings.pipelines,
    queryFn: settingsService.getPipelines,
    skip: isDirty,
    hydrate: useCallback(
      (pipelines: Pipeline[]) => {
        const existing = pipelines.find((pipeline) => pipeline.isDefault) ?? pipelines[0]
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

  const indexOf = useCallback(
    (id: string) => fields.findIndex((field) => field.id === id),
    [fields],
  )

  const handleAddStage = useCallback(() => append(PIPELINE_STAGE_DEFAULT), [append])

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
      if (patch.name !== undefined) setField(`stages.${index}.name`, patch.name)
      if (patch.color !== undefined) setField(`stages.${index}.color`, patch.color)
      if (patch.probability !== undefined)
        setField(`stages.${index}.probability`, patch.probability)
    },
    [indexOf, setField],
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
        stages: form.stages.map(({ name, color, probability }) => ({ name, color, probability })),
      })
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onNext,
    errorTitle: t('auth.toasts.pipelineFailed'),
    onSuccess: () => reset(getValues(), { keepValues: true }),
  })

  return useMemo(
    () => ({
      control,
      fields,
      bindField,
      handleAddStage,
      handleRemoveStage,
      handleUpdateStage,
      handleReorderStages,
      handleSave,
      isPending,
    }),
    [
      control,
      fields,
      bindField,
      handleAddStage,
      handleRemoveStage,
      handleUpdateStage,
      handleReorderStages,
      handleSave,
      isPending,
    ],
  )
}
