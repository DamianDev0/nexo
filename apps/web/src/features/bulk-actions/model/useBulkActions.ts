'use client'

import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { buildActionRequest, bulkActionsFor, bulkScope } from '../lib/bulk-action-registry'
import { buildBulkLabels } from '../lib/bulk-labels'

import { useBulkDialog } from './useBulkDialog'
import { useBulkFeedback } from './useBulkFeedback'
import { useBulkJob } from './useBulkJob'
import { useBulkSelection } from './useBulkSelection'

import type { BulkActionId } from '../config/bulk-action-registry.constants'
import type { BulkActionSelection, CustomFieldEntity } from '@repo/shared-types'

type BulkActionsArgs = {
  readonly entity?: CustomFieldEntity
  readonly archived: boolean
  readonly total: number
  readonly rows: {
    readonly selectedIds: () => string[]
    readonly selectedTags: () => string[]
    readonly selectedCount: number
    readonly clear: () => void
  }
  readonly filterSelection: () => BulkActionSelection
}

export function useBulkActions({
  entity = 'contacts',
  archived,
  total,
  rows,
  filterSelection,
}: BulkActionsArgs) {
  const { t } = useTranslation()
  const selection = useBulkSelection({
    selectedIds: rows.selectedIds,
    selectedCount: rows.selectedCount,
    total,
    filterSelection,
    clear: rows.clear,
  })
  const dialog = useBulkDialog()
  const job = useBulkJob()

  const { track } = job
  const trackRevert = useCallback((revert: { id: string }) => track(revert.id), [track])
  useBulkFeedback({ finished: job.finished, onAnnounced: job.release, onUndoQueued: trackRevert })

  const { selectedTags } = rows
  const openDialog = useCallback(
    (id: BulkActionId) =>
      dialog.open(id, {
        tags: id === 'remove_tags' && !selection.allMatching ? selectedTags() : null,
      }),
    [dialog, selection.allMatching, selectedTags],
  )

  const submit = useCallback(
    (id: BulkActionId, params: Record<string, unknown> = {}) => {
      if (selection.count === 0) return
      job.start(buildActionRequest(id, entity, selection.current(), params), () => {
        dialog.close()
        selection.reset()
      })
    },
    [selection, job, entity, dialog],
  )

  const labels = useMemo(
    () => buildBulkLabels(t, selection.allMatching, total),
    [t, selection.allMatching, total],
  )

  return {
    bar: {
      labels,
      actions: bulkActionsFor(bulkScope(archived)),
      onSelectAll: selection.allMatching ? undefined : selection.selectAll,
      isBusy: job.isBusy,
      progress: job.running,
      onOpen: openDialog,
    },
    dialogs: {
      open: dialog.kind,
      context: dialog.context,
      close: dialog.close,
      count: selection.count,
      submit,
    },
  }
}

export type BulkActionsController = ReturnType<typeof useBulkActions>
