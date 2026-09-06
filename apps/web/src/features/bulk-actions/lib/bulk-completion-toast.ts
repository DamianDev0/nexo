import { bulkOutcomeToast, isBulkActionRevertible } from '@/entities/bulk-action'

import type { BulkAction } from '@repo/shared-types'
import type { TFunction } from 'i18next'

type CompletionHandlers = {
  readonly onUndo: (id: string) => void
  readonly onDownload: (url: string) => void
}

export type CompletionToast = {
  readonly tone: 'success' | 'error'
  readonly title: string
  readonly description?: string
  readonly button?: { readonly title: string; readonly onClick: () => void }
}

export function buildCompletionToast(
  t: TFunction,
  action: BulkAction,
  handlers: CompletionHandlers,
): CompletionToast {
  const base = bulkOutcomeToast(t, action)

  if (action.action === 'export' && action.resultFileUrl) {
    const url = action.resultFileUrl
    return {
      ...base,
      description: t('contacts.bulk.toasts.downloadHint'),
      button: {
        title: t('contacts.bulk.toasts.download'),
        onClick: () => handlers.onDownload(url),
      },
    }
  }

  if (isBulkActionRevertible(action) && action.succeeded > 0) {
    return {
      ...base,
      description: t('contacts.bulk.toasts.undoHint'),
      button: { title: t('contacts.bulk.toasts.undo'), onClick: () => handlers.onUndo(action.id) },
    }
  }

  return base
}
