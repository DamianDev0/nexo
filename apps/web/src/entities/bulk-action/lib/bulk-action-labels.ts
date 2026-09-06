import { BULK_ACTION_ACTIVE_STATUSES, BULK_REVERTIBLE_KINDS } from '@repo/shared-types'

import type { BulkAction, BulkActionStatus } from '@repo/shared-types'
import type { TFunction } from 'i18next'

const FIELD_LABEL_KEYS: Readonly<Record<string, string>> = {
  status: 'contacts.bulk.changeStatus',
  lifecycleStage: 'contacts.bulk.changeLifecycle',
}

export function isBulkActionActive(status: BulkActionStatus): boolean {
  return BULK_ACTION_ACTIVE_STATUSES.includes(status)
}

export function isBulkActionRevertible(
  action: Pick<BulkAction, 'action' | 'status' | 'revertedAt'>,
): boolean {
  return (
    BULK_REVERTIBLE_KINDS.includes(action.action) &&
    (action.status === 'completed' || action.status === 'completed_with_errors') &&
    action.revertedAt === null
  )
}

export function bulkProgressPercent(action: Pick<BulkAction, 'processed' | 'total'>): number {
  if (action.total === 0) return 100
  return Math.min(100, Math.round((action.processed / action.total) * 100))
}

export function bulkStatusLabel(t: TFunction, status: BulkActionStatus): string {
  return t(`contacts.bulk.status.${status}`)
}

export function bulkKindLabel(t: TFunction, kind: BulkAction['action']): string {
  return t(`contacts.bulk.actions.${kind}`)
}

export function bulkActionLabel(
  t: TFunction,
  action: Pick<BulkAction, 'action' | 'params'>,
): string {
  if (action.action === 'update_field') {
    const field = action.params['field']
    const key = typeof field === 'string' ? FIELD_LABEL_KEYS[field] : undefined
    if (key) return t(key)
  }
  return bulkKindLabel(t, action.action)
}

export function bulkOutcomeToast(
  t: TFunction,
  action: Pick<BulkAction, 'status' | 'succeeded' | 'failed' | 'action' | 'params'>,
): { readonly tone: 'success' | 'error'; readonly title: string } {
  const kind = bulkActionLabel(t, action)
  switch (action.status) {
    case 'completed':
      return {
        tone: 'success',
        title: t('contacts.bulk.toasts.completed', { kind, succeeded: action.succeeded }),
      }
    case 'completed_with_errors':
      return {
        tone: 'error',
        title: t('contacts.bulk.toasts.completedWithErrors', {
          kind,
          succeeded: action.succeeded,
          failed: action.failed,
        }),
      }
    case 'cancelled':
      return { tone: 'error', title: t('contacts.bulk.toasts.cancelled', { kind }) }
    default:
      return { tone: 'error', title: t('contacts.bulk.toasts.failed', { kind }) }
  }
}
