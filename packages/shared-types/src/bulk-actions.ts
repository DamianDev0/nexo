import type { ContactListQuery } from './contacts'
import type { CustomFieldEntity } from './settings'

export const BULK_ACTION_KINDS = [
  'add_tags',
  'remove_tags',
  'assign',
  'update_field',
  'send_email',
  'send_sms',
  'send_whatsapp',
  'export',
  'archive',
  'restore',
  'revert',
] as const

export type BulkActionKind = (typeof BULK_ACTION_KINDS)[number]

export const BULK_ACTION_STATUSES = [
  'queued',
  'running',
  'paused',
  'completed',
  'completed_with_errors',
  'failed',
  'cancelled',
] as const

export type BulkActionStatus = (typeof BULK_ACTION_STATUSES)[number]

export const BULK_REVERTIBLE_KINDS: ReadonlyArray<BulkActionKind> = [
  'add_tags',
  'remove_tags',
  'assign',
  'update_field',
  'archive',
  'restore',
]

export const BULK_ACTION_ACTIVE_STATUSES: ReadonlyArray<BulkActionStatus> = [
  'queued',
  'running',
  'paused',
]

export type BulkActionSelection =
  | { mode: 'ids'; ids: string[] }
  | { mode: 'filter'; query: ContactListQuery }

export type BulkActionDrip = {
  batchSize: number
  intervalSeconds: number
}

export type CreateBulkActionInput = {
  entity: CustomFieldEntity
  action: BulkActionKind
  params: Record<string, unknown>
  selection: BulkActionSelection
  drip?: BulkActionDrip
}

export type BulkActionError = {
  id: string
  message: string
}

export type BulkAction = {
  id: string
  entity: CustomFieldEntity
  action: BulkActionKind
  params: Record<string, unknown>
  status: BulkActionStatus
  total: number
  processed: number
  succeeded: number
  failed: number
  errors: BulkActionError[]
  resultFileUrl: string | null
  revertedAt: string | null
  revertsId: string | null
  createdById: string
  createdByName: string | null
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
}

export type BulkActionListQuery = {
  entity?: CustomFieldEntity
  status?: BulkActionStatus
  createdById?: string
  page?: number
  limit?: number
}

export type PaginatedBulkActions = {
  data: BulkAction[]
  total: number
  page: number
  limit: number
}
