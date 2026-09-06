import { UserRole } from '@repo/shared-types'
import type { BulkActionKind, BulkExportFormat, CustomFieldEntity } from '@repo/shared-types'
import type { SnapshotColumn } from '../interfaces/bulk-action-row.interfaces'

export const BULK_BATCH_SIZE = 500

export const BULK_MAX_SELECTION_IDS = 10_000

export const BULK_MAX_FILTER_TARGETS = 100_000

export const BULK_MAX_STORED_ERRORS = 200

export const BULK_MAX_ACTIVE_PER_TENANT = 5

export const BULK_EXPORT_URL_TTL_SECONDS = 7 * 24 * 3600

export const BULK_TABLES: Readonly<Record<CustomFieldEntity, string>> = {
  contacts: 'contacts',
  companies: 'companies',
  deals: 'deals',
}

const ALL_ENTITIES: ReadonlyArray<CustomFieldEntity> = ['contacts', 'companies', 'deals']

export const BULK_ACTION_ENTITIES: Readonly<
  Record<BulkActionKind, ReadonlyArray<CustomFieldEntity>>
> = {
  add_tags: ALL_ENTITIES,
  remove_tags: ALL_ENTITIES,
  assign: ALL_ENTITIES,
  update_field: ['contacts'],
  send_email: ['contacts'],
  send_sms: ['contacts'],
  send_whatsapp: ['contacts'],
  export: ALL_ENTITIES,
  archive: ALL_ENTITIES,
  restore: ALL_ENTITIES,
  revert: ALL_ENTITIES,
}

export const BULK_ACTION_MIN_ROLE: Readonly<Record<BulkActionKind, UserRole>> = {
  add_tags: UserRole.MANAGER,
  remove_tags: UserRole.MANAGER,
  assign: UserRole.MANAGER,
  update_field: UserRole.MANAGER,
  send_email: UserRole.MARKETING,
  send_sms: UserRole.MARKETING,
  send_whatsapp: UserRole.MARKETING,
  export: UserRole.SALES_REP,
  archive: UserRole.MANAGER,
  restore: UserRole.MANAGER,
  revert: UserRole.MANAGER,
}

export const BULK_CONTACT_FIELD_SQL: Readonly<Record<string, string>> = {
  status: 'status = $2, status_changed_at = NOW()',
  lifecycleStage: 'lifecycle_stage = $2',
  source: 'source = $2',
}

export const BULK_SNAPSHOT_COLUMN_BY_FIELD: Readonly<Record<string, SnapshotColumn>> = {
  status: 'status',
  lifecycleStage: 'lifecycle_stage',
  source: 'source',
}

export const BULK_CUSTOM_FIELD_PREFIX = 'custom:'

export const BULK_MESSAGE_CHANNEL: Readonly<
  Record<'send_email' | 'send_sms' | 'send_whatsapp', 'email' | 'sms' | 'whatsapp'>
> = {
  send_email: 'email',
  send_sms: 'sms',
  send_whatsapp: 'whatsapp',
}

export const BULK_EXPORT_HIDDEN_COLUMNS: ReadonlySet<string> = new Set(['is_active'])

export const BULK_EXPORT_FILE_META: Readonly<
  Record<BulkExportFormat, { readonly extension: string; readonly mimeType: string }>
> = {
  csv: { extension: '.csv', mimeType: 'text/csv' },
  xlsx: {
    extension: '.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  json: { extension: '.json', mimeType: 'application/json' },
}

export const BULK_ACTION_COLUMNS = `
  id, entity, action, params, selection_mode, selection_ids, selection_query,
  status, total, processed, succeeded, failed, errors, result_file_url, drip, job_id,
  reverted_at, reverts_id, created_by, started_at, finished_at, created_at, updated_at
`

export const BULK_ACTION_LIST_COLUMNS = `
  ${BULK_ACTION_COLUMNS},
  (SELECT u.full_name FROM users u WHERE u.id = bulk_actions.created_by) AS created_by_name
`

export const BULK_SNAPSHOT_COLUMNS = 'entity_id, before'
