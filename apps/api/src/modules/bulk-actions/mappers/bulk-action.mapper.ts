import type { BulkAction } from '@repo/shared-types'
import type { BulkActionRow } from '../interfaces/bulk-action-row.interfaces'

export function mapBulkAction(r: BulkActionRow): BulkAction {
  return {
    id: r.id,
    entity: r.entity,
    action: r.action,
    params: r.params ?? {},
    status: r.status,
    total: r.total,
    processed: r.processed,
    succeeded: r.succeeded,
    failed: r.failed,
    errors: r.errors ?? [],
    resultFileUrl: r.result_file_url,
    revertedAt: r.reverted_at,
    revertsId: r.reverts_id,
    createdById: r.created_by,
    createdByName: r.created_by_name ?? null,
    startedAt: r.started_at,
    finishedAt: r.finished_at,
    createdAt: r.created_at,
  }
}
