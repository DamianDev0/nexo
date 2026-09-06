'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import {
  bulkOutcomeToast,
  isBulkActionActive,
  useBulkActionStatus,
  useCreateBulkAction,
} from '@/entities/bulk-action'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { BULK_STATUS_FIELD } from '../config/bulk-actions.constants'
import { buildBulkLabels } from '../lib/bulk-labels'
import { buildBulkRequest, filterSelection, idsSelection, selectionSize } from '../lib/bulk-request'

import type { BulkDialogKind } from './types/bulk-actions.types'
import type { BulkActionKind, ContactListQuery } from '@repo/shared-types'

type BulkActionsArgs = {
  readonly selectedIds: () => string[]
  readonly selectedCount: number
  readonly clearSelection: () => void
  readonly query: ContactListQuery
  readonly total: number
}

export function useBulkActions({
  selectedIds,
  selectedCount,
  clearSelection,
  query,
  total,
}: BulkActionsArgs) {
  const archived = query.archived === true
  const { t } = useTranslation()
  const client = useQueryClient()
  const [dialog, setDialog] = useState<BulkDialogKind | null>(null)
  const [allMatching, setAllMatching] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const create = useCreateBulkAction()
  const status = useBulkActionStatus(activeId)
  const announced = useRef<string | null>(null)

  useEffect(() => setAllMatching(false), [selectedCount])

  const finished = status.data && !isBulkActionActive(status.data.status) ? status.data : null
  useEffect(() => {
    if (!finished || announced.current === finished.id) return
    announced.current = finished.id
    const toast = bulkOutcomeToast(t, finished)
    sileo[toast.tone]({ title: toast.title })
    setActiveId(null)
    void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
  }, [finished, t, client])

  const selection = useCallback(
    () => (allMatching ? filterSelection(query) : idsSelection(selectedIds())),
    [allMatching, query, selectedIds],
  )

  const run = useCallback(
    (action: BulkActionKind, params: Record<string, unknown> = {}) => {
      const target = selection()
      if (selectionSize(target, total) === 0) return
      create.mutate(buildBulkRequest(action, target, params), {
        onSuccess: (created) => {
          setActiveId(created.id)
          setDialog(null)
          setAllMatching(false)
          clearSelection()
        },
      })
    },
    [selection, total, create, clearSelection],
  )

  const labels = useMemo(() => buildBulkLabels(t, allMatching), [t, allMatching])
  const isBusy = create.isPending || activeId !== null

  return {
    bar: {
      labels,
      onSelectAll: allMatching ? undefined : () => setAllMatching(true),
      archived,
      isBusy,
      progress: status.data && isBulkActionActive(status.data.status) ? status.data : null,
      onOpen: (kind: BulkDialogKind) => setDialog(kind),
      onExport: () => run('export'),
    },
    dialogs: {
      open: dialog,
      close: () => setDialog(null),
      count: selectionSize(selection(), total),
      addTags: (tags: string[]) => run('add_tags', { tags }),
      removeTags: (tags: string[]) => run('remove_tags', { tags }),
      setStatus: (value: string) => run('update_field', { field: BULK_STATUS_FIELD, value }),
      archive: () => run('archive'),
      restore: () => run('restore'),
    },
  }
}

export type BulkActionsController = ReturnType<typeof useBulkActions>
