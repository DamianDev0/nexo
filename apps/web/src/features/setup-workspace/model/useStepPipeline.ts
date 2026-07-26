import { STAGE_COLOR_OPTIONS } from '@repo/shared-utils'
import { t } from 'i18next'
import { useState } from 'react'

import settingsService from '@/shared/api/services/settings.service'
import { useEditableList } from '@/shared/lib/hooks/useEditableList'

import { useStepMutation } from './useStepMutation'

import type { CreatePipelineRequest } from '@repo/shared-types'

type Stage = CreatePipelineRequest['stages'][number]

const DEFAULT_STAGES: Stage[] = [
  { name: 'MQL', color: STAGE_COLOR_OPTIONS[0], probability: 10 },
  { name: 'SQL', color: STAGE_COLOR_OPTIONS[1], probability: 25 },
  { name: 'Demo Scheduled', color: STAGE_COLOR_OPTIONS[3], probability: 40 },
  { name: 'Proposal', color: STAGE_COLOR_OPTIONS[4], probability: 60 },
  { name: 'Negotiation', color: STAGE_COLOR_OPTIONS[5], probability: 80 },
  { name: 'Closed Won', color: STAGE_COLOR_OPTIONS[6], probability: 100 },
]

function newStage(): Stage {
  return { name: 'New Stage', color: STAGE_COLOR_OPTIONS[9], probability: 50 }
}

export function useStepPipeline(onNext: () => void) {
  const [pipelineName, setPipelineName] = useState('Sales Pipeline')
  const { items: stages, add, remove, update } = useEditableList<Stage>(DEFAULT_STAGES, newStage)

  const { handleSave, isPending } = useStepMutation({
    mutationFn: () =>
      settingsService.createPipeline({
        name: pipelineName,
        isDefault: true,
        stages: stages.map(({ id: _id, ...stage }) => stage),
      }),
    onNext,
    errorTitle: t('auth.toasts.pipelineFailed'),
  })

  return {
    pipelineName,
    setPipelineName,
    stages,
    handleAddStage: add,
    handleRemoveStage: remove,
    handleUpdateStage: update,
    handleSave,
    isPending,
  }
}
