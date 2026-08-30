'use client'

import { t } from 'i18next'
import { useCallback, useMemo, useState } from 'react'

import { HEX_COLOR_PALETTE } from '../config/hex-palette.constants'
import { DEFAULT_STAGE_KEYS } from '../config/pipelines.constants'
import { defaultStageInputs } from '../lib/stage-edit'
import { usePipelinesAdmin } from '../query/usePipelinesAdmin'

import type { PipelineCardActions } from './types'
import type { PipelineStageInput } from '@/shared/api/services/settings.service'

export function usePipelinesPane() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const admin = usePipelinesAdmin()
  const { pipelines, patch, remove, replaceStages } = admin

  const onCreate = useCallback(
    (name: string) => {
      const trimmed = name.trim()
      if (trimmed.length === 0) return
      const stageNames = DEFAULT_STAGE_KEYS.map((key) =>
        t(`settings.pipelines.defaultStages.${key}`),
      )
      admin.create({ name: trimmed, stages: defaultStageInputs(stageNames, HEX_COLOR_PALETTE) })
      setCreatorOpen(false)
    },
    [admin],
  )

  const actions: PipelineCardActions = useMemo(
    () => ({
      onRename: (id, name) => {
        const trimmed = name.trim()
        if (trimmed.length > 0) patch({ id, data: { name: trimmed } })
      },
      onSetDefault: (id) => patch({ id, data: { isDefault: true } }),
      onRequestRemove: (id) => setRemovingId(id),
      onToggleExpand: (id) => setExpandedId((prev) => (prev === id ? null : id)),
      onSaveStages: (id: string, stages: PipelineStageInput[]) => replaceStages({ id, stages }),
    }),
    [patch, replaceStages],
  )

  const removing = pipelines.find((pipeline) => pipeline.id === removingId) ?? null
  const closeRemove = useCallback(() => setRemovingId(null), [])
  const confirmRemove = useCallback(() => {
    if (removingId) remove(removingId)
    setRemovingId(null)
  }, [remove, removingId])

  return {
    pipelines,
    isPending: admin.isPending,
    expandedId,
    actions,
    creator: {
      open: creatorOpen,
      onOpenChange: setCreatorOpen,
      openCreate: () => setCreatorOpen(true),
      onSubmit: onCreate,
    },
    removal: removing
      ? { name: removing.name, cancel: closeRemove, confirm: confirmRemove }
      : null,
  }
}
