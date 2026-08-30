'use client'

import { t } from 'i18next'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { HEX_COLOR_PALETTE } from '../config/hex-palette.constants'
import { DEFAULT_STAGE_PROBABILITY } from '../config/pipelines.constants'
import {
  moveStageDraft,
  removeStageDraft,
  stageDraftsEqual,
  stageDraftsValid,
  toStageDrafts,
  toStageInputs,
  updateStageDraft,
} from '../lib/stage-edit'

import type { StageDraft } from '../lib/stage-edit'
import type { PipelineStageInput } from '@/shared/api/services/settings.service'
import type { PipelineStage } from '@repo/shared-types'

type StageEditorInput = {
  stages: PipelineStage[]
  onSave: (stages: PipelineStageInput[]) => void
}

export function useStageEditor({ stages, onSave }: StageEditorInput) {
  const initial = useMemo(() => toStageDrafts(stages), [stages])
  const [drafts, setDrafts] = useState<StageDraft[]>(initial)

  useEffect(() => {
    setDrafts(initial)
  }, [initial])

  const add = useCallback(() => {
    setDrafts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: t('settings.pipelines.newStageName'),
        color: HEX_COLOR_PALETTE[prev.length % HEX_COLOR_PALETTE.length] ?? '',
        probability: DEFAULT_STAGE_PROBABILITY,
      },
    ])
  }, [])

  const update = useCallback((id: string, patch: Partial<Omit<StageDraft, 'id'>>) => {
    setDrafts((prev) => updateStageDraft(prev, id, patch))
  }, [])

  const remove = useCallback((id: string) => {
    setDrafts((prev) => removeStageDraft(prev, id))
  }, [])

  const move = useCallback((id: string, direction: -1 | 1) => {
    setDrafts((prev) => moveStageDraft(prev, id, direction))
  }, [])

  const dirty = !stageDraftsEqual(drafts, initial)
  const valid = stageDraftsValid(drafts)

  const save = useCallback(() => {
    onSave(toStageInputs(drafts))
  }, [drafts, onSave])

  const discard = useCallback(() => setDrafts(initial), [initial])

  return { drafts, add, update, remove, move, dirty, valid, save, discard }
}
