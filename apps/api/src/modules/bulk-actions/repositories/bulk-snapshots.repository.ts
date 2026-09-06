import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { sqlRows } from '@/shared/database/sql.util'
import { BULK_SNAPSHOT_COLUMNS } from '../constants/bulk-action.constants'
import type { BulkSnapshotRow } from '../interfaces/bulk-action-row.interfaces'

@Injectable()
export class BulkSnapshotsRepository {
  constructor(private readonly db: TenantDbService) {}

  async insertMany(
    schemaName: string,
    bulkActionId: string,
    rows: ReadonlyArray<BulkSnapshotRow>,
  ): Promise<void> {
    if (rows.length === 0) return
    await this.db.query(schemaName, async (qr) => {
      await qr.query(
        `INSERT INTO bulk_action_snapshots (bulk_action_id, entity_id, before)
         SELECT $1, entity_id, before
         FROM jsonb_to_recordset($2::jsonb) AS s(entity_id uuid, before jsonb)
         ON CONFLICT (bulk_action_id, entity_id) DO NOTHING`,
        [bulkActionId, JSON.stringify(rows)],
      )
    })
  }

  async findByAction(
    schemaName: string,
    bulkActionId: string,
    ids?: ReadonlyArray<string>,
  ): Promise<BulkSnapshotRow[]> {
    return this.db.query(schemaName, async (qr) => {
      return sqlRows<BulkSnapshotRow[]>(
        qr,
        `SELECT ${BULK_SNAPSHOT_COLUMNS} FROM bulk_action_snapshots
         WHERE bulk_action_id = $1 AND ($2::uuid[] IS NULL OR entity_id = ANY($2::uuid[]))`,
        [bulkActionId, ids ?? null],
      )
    })
  }

  async countByAction(schemaName: string, bulkActionId: string): Promise<number> {
    return this.db.query(schemaName, async (qr) => {
      const rows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM bulk_action_snapshots WHERE bulk_action_id = $1`,
        [bulkActionId],
      )
      return Number.parseInt(rows[0].count, 10)
    })
  }
}
