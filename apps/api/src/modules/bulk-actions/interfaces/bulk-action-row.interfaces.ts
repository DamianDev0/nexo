import type {
  BulkActionDrip,
  BulkActionError,
  BulkActionKind,
  BulkActionStatus,
  ContactListQuery,
  CustomFieldEntity,
} from '@repo/shared-types'

export interface BulkActionRow {
  id: string
  entity: CustomFieldEntity
  action: BulkActionKind
  params: Record<string, unknown>
  selection_mode: 'ids' | 'filter'
  selection_ids: string[]
  selection_query: ContactListQuery | null
  status: BulkActionStatus
  total: number
  processed: number
  succeeded: number
  failed: number
  errors: BulkActionError[]
  result_file_url: string | null
  drip: BulkActionDrip | null
  job_id: string | null
  reverted_at: string | null
  reverts_id: string | null
  created_by: string
  created_by_name?: string | null
  started_at: string | null
  finished_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateBulkActionRecord {
  entity: CustomFieldEntity
  action: BulkActionKind
  params: Record<string, unknown>
  selectionMode: 'ids' | 'filter'
  selectionIds: string[]
  selectionQuery: ContactListQuery | null
  total: number
  drip: BulkActionDrip | null
  createdBy: string
  revertsId: string | null
}

export interface BulkActionListFilters {
  entity?: CustomFieldEntity
  status?: BulkActionStatus
  createdById?: string
  page: number
  limit: number
}

export interface BulkProgressPatch {
  processed: number
  succeeded: number
  failed: number
  errors: BulkActionError[]
}

export interface BulkActionJobData {
  bulkActionId: string
  schemaName: string
  tenantId: string
  tenantSlug: string
}

export interface BatchOutcome {
  succeeded: string[]
  errors: BulkActionError[]
}

export interface BulkRunContext {
  schemaName: string
  tenantId: string
  tenantSlug: string
  action: BulkActionRow
}

export interface BulkMessageTemplateRow {
  id: string
  channel: string
  format: string | null
  subject: string | null
  body: string
}

export interface BulkRecipientRow {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  opted_out: boolean
}

export const SNAPSHOT_COLUMNS = [
  'tags',
  'status',
  'lifecycle_stage',
  'source',
  'assigned_to_id',
  'is_active',
] as const

export type SnapshotColumn = (typeof SNAPSHOT_COLUMNS)[number]

export interface SnapshotSpec {
  columns: ReadonlyArray<SnapshotColumn>
  customKey?: string
}

export type SnapshotBefore = Partial<Record<SnapshotColumn, unknown>> & {
  custom_fields?: Record<string, unknown>
}

export interface BulkSnapshotRow {
  entity_id: string
  before: SnapshotBefore
}
