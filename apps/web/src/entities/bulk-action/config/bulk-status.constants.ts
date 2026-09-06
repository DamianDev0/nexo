import type { BulkActionStatus } from '@repo/shared-types'

export const BULK_POLL_INTERVAL_MS = 2000

export type BulkStatusTone = 'neutral' | 'info' | 'warning' | 'positive' | 'negative'

export const BULK_STATUS_TONE: Readonly<Record<BulkActionStatus, BulkStatusTone>> = {
  queued: 'neutral',
  running: 'info',
  paused: 'warning',
  completed: 'positive',
  completed_with_errors: 'warning',
  failed: 'negative',
  cancelled: 'neutral',
}
