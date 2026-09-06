'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import { useRevertBulkAction } from '@/entities/bulk-action'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import {
  BULK_ACTIONABLE_TOAST_AUTOPILOT,
  BULK_ACTIONABLE_TOAST_DURATION_MS,
} from '../config/bulk-actions.constants'
import { buildCompletionToast, type CompletionToast } from '../lib/bulk-completion-toast'

import type { BulkAction } from '@repo/shared-types'

type BulkFeedbackArgs = {
  readonly finished: BulkAction | null
  readonly onAnnounced: () => void
  readonly onUndoQueued: (revert: BulkAction) => void
}

function announce(toast: CompletionToast): void {
  sileo[toast.tone](
    toast.button
      ? {
          title: toast.title,
          description: toast.description,
          button: toast.button,
          duration: BULK_ACTIONABLE_TOAST_DURATION_MS,
          autopilot: BULK_ACTIONABLE_TOAST_AUTOPILOT,
        }
      : { title: toast.title },
  )
}

export function useBulkFeedback({ finished, onAnnounced, onUndoQueued }: BulkFeedbackArgs): void {
  const { t } = useTranslation()
  const client = useQueryClient()
  const revert = useRevertBulkAction()
  const announced = useRef<string | null>(null)

  useEffect(() => {
    if (!finished || announced.current === finished.id) return
    announced.current = finished.id
    announce(
      buildCompletionToast(t, finished, {
        onUndo: (id) =>
          revert.mutate(id, {
            onSuccess: (created) => {
              sileo.info({ title: t('contacts.bulk.toasts.undoQueued') })
              onUndoQueued(created)
            },
          }),
        onDownload: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
      }),
    )
    onAnnounced()
    void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
  }, [finished, t, client, revert, onAnnounced, onUndoQueued])
}
