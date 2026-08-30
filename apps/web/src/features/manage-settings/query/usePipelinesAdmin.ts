'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import settingsService from '@/shared/api/services/settings.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type {
  CreatePipelineInput,
  PipelinePatch,
  PipelineStageInput,
} from '@/shared/api/services/settings.service'

export function usePipelinesAdmin() {
  const queryClient = useQueryClient()

  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.settings.pipelines,
    queryFn: () => settingsService.getPipelines(),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.pipelines })
  }

  const onError = (error: { message?: string }) => notifySaveFailed(error)

  const create = useMutation({
    mutationFn: (input: CreatePipelineInput) => settingsService.createPipeline(input),
    onSuccess: () => {
      invalidate()
      sileo.success({ title: t('settings.pipelines.created') })
    },
    onError,
  })

  const patch = useMutation({
    mutationFn: ({ id, data: patchData }: { id: string; data: PipelinePatch }) =>
      settingsService.patchPipeline(id, patchData),
    onSuccess: () => {
      invalidate()
      sileo.success({ title: t('settings.saved') })
    },
    onError,
  })

  const remove = useMutation({
    mutationFn: (id: string) => settingsService.deletePipeline(id),
    onSuccess: () => {
      invalidate()
      sileo.success({ title: t('settings.pipelines.deleted') })
    },
    onError,
  })

  const replaceStages = useMutation({
    mutationFn: ({ id, stages }: { id: string; stages: PipelineStageInput[] }) =>
      settingsService.replacePipelineStages(id, stages),
    onSuccess: () => {
      invalidate()
      sileo.success({ title: t('settings.pipelines.stagesSaved') })
    },
    onError,
  })

  return {
    pipelines: data ?? [],
    isPending,
    create: create.mutate,
    patch: patch.mutate,
    remove: remove.mutate,
    replaceStages: replaceStages.mutate,
  }
}
