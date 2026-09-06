import { Injectable } from '@nestjs/common'
import { BULK_ACTION_ACTIVE_STATUSES } from '@repo/shared-types'
import type { BulkActionStatus } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { sqlRows } from '@/shared/database/sql.util'
import {
  BULK_ACTION_COLUMNS,
  BULK_ACTION_LIST_COLUMNS,
  BULK_MAX_STORED_ERRORS,
} from '../constants/bulk-action.constants'
import type {
  BulkActionListFilters,
  BulkActionRow,
  BulkProgressPatch,
  CreateBulkActionRecord,
} from '../interfaces/bulk-action-row.interfaces'

@Injectable()
export class BulkActionsRepository {
  constructor(private readonly db: TenantDbService) {}

  async insert(schemaName: string, data: CreateBulkActionRecord): Promise<BulkActionRow> {
    return this.db.query(schemaName, async (qr) => {
      const rows = await sqlRows<BulkActionRow[]>(
        qr,
        `INSERT INTO bulk_actions
           (entity, action, params, selection_mode, selection_ids, selection_query, total, drip, created_by, reverts_id)
         VALUES ($1, $2, $3, $4, $5::uuid[], $6, $7, $8, $9, $10)
         RETURNING ${BULK_ACTION_COLUMNS}`,
        [
          data.entity,
          data.action,
          data.params,
          data.selectionMode,
          data.selectionIds,
          data.selectionQuery,
          data.total,
          data.drip,
          data.createdBy,
          data.revertsId,
        ],
      )
      return rows[0]!
    })
  }

  async findById(schemaName: string, id: string): Promise<BulkActionRow | null> {
    return this.db.query(schemaName, async (qr) => {
      const rows = await sqlRows<BulkActionRow[]>(
        qr,
        `SELECT ${BULK_ACTION_LIST_COLUMNS} FROM bulk_actions WHERE id = $1`,
        [id],
      )
      return rows[0] ?? null
    })
  }

  async findPage(
    schemaName: string,
    filters: BulkActionListFilters,
  ): Promise<{ rows: BulkActionRow[]; total: number }> {
    return this.db.query(schemaName, async (qr) => {
      const conditions: string[] = ['TRUE']
      const params: unknown[] = []
      const push = (clause: string, value: unknown) => {
        params.push(value)
        conditions.push(clause.replace('?', `$${params.length}`))
      }
      if (filters.entity) push('entity = ?', filters.entity)
      if (filters.status) push('status = ?', filters.status)
      if (filters.createdById) push('created_by = ?', filters.createdById)
      const where = conditions.join(' AND ')

      const countRows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM bulk_actions WHERE ${where}`,
        params,
      )
      const dataParams = [...params, filters.limit, (filters.page - 1) * filters.limit]
      const rows = await sqlRows<BulkActionRow[]>(
        qr,
        `SELECT ${BULK_ACTION_LIST_COLUMNS} FROM bulk_actions
         WHERE ${where}
         ORDER BY created_at DESC, id ASC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )
      return { rows, total: Number.parseInt(countRows[0].count, 10) }
    })
  }

  async countActive(schemaName: string): Promise<number> {
    return this.db.query(schemaName, async (qr) => {
      const rows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM bulk_actions WHERE status = ANY($1::text[])`,
        [BULK_ACTION_ACTIVE_STATUSES],
      )
      return Number.parseInt(rows[0].count, 10)
    })
  }

  async setJobId(schemaName: string, id: string, jobId: string): Promise<void> {
    await this.db.query(schemaName, async (qr) => {
      await qr.query(`UPDATE bulk_actions SET job_id = $2, updated_at = NOW() WHERE id = $1`, [
        id,
        jobId,
      ])
    })
  }

  async transition(
    schemaName: string,
    id: string,
    from: ReadonlyArray<BulkActionStatus>,
    to: BulkActionStatus,
  ): Promise<BulkActionRow | null> {
    return this.db.query(schemaName, async (qr) => {
      const rows = await sqlRows<BulkActionRow[]>(
        qr,
        `UPDATE bulk_actions
         SET status = $3::text,
             started_at = CASE WHEN $3::text = 'running' THEN COALESCE(started_at, NOW()) ELSE started_at END,
             finished_at = CASE WHEN $3::text IN ('completed', 'completed_with_errors', 'failed', 'cancelled')
                                THEN NOW() ELSE finished_at END,
             updated_at = NOW()
         WHERE id = $1 AND status = ANY($2::text[])
         RETURNING ${BULK_ACTION_COLUMNS}`,
        [id, from, to],
      )
      return rows[0] ?? null
    })
  }

  async recordProgress(
    schemaName: string,
    id: string,
    patch: BulkProgressPatch,
  ): Promise<BulkActionRow | null> {
    return this.db.query(schemaName, async (qr) => {
      const rows = await sqlRows<BulkActionRow[]>(
        qr,
        `UPDATE bulk_actions
         SET processed = processed + $2,
             succeeded = succeeded + $3,
             failed = failed + $4,
             errors = (
               SELECT COALESCE(jsonb_agg(e), '[]'::jsonb)
               FROM (SELECT e FROM jsonb_array_elements(errors || $5::jsonb) AS e LIMIT $6) AS kept
             ),
             updated_at = NOW()
         WHERE id = $1
         RETURNING ${BULK_ACTION_COLUMNS}`,
        [
          id,
          patch.processed,
          patch.succeeded,
          patch.failed,
          JSON.stringify(patch.errors),
          BULK_MAX_STORED_ERRORS,
        ],
      )
      return rows[0] ?? null
    })
  }

  async markReverted(schemaName: string, id: string): Promise<void> {
    await this.db.query(schemaName, async (qr) => {
      await qr.query(
        `UPDATE bulk_actions SET reverted_at = NOW(), updated_at = NOW() WHERE id = $1 AND reverted_at IS NULL`,
        [id],
      )
    })
  }

  async setResultFile(schemaName: string, id: string, url: string): Promise<void> {
    await this.db.query(schemaName, async (qr) => {
      await qr.query(
        `UPDATE bulk_actions SET result_file_url = $2, updated_at = NOW() WHERE id = $1`,
        [id, url],
      )
    })
  }
}
