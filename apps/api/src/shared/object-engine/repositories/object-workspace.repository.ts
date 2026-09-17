import { Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import type { ObjectTableState, ObjectType } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { sqlRows } from '@/shared/database/sql.util'
import type { ObjectWorkspaceStateRow } from '../interfaces/object-view-row.interfaces'

@Injectable()
export class ObjectWorkspaceRepository {
  constructor(private readonly db: TenantDbService) {}

  async findState(
    schemaName: string,
    objectType: ObjectType,
    userId: string,
  ): Promise<ObjectWorkspaceStateRow | null> {
    return this.db.query(schemaName, async (qr) => this.loadState(qr, objectType, userId))
  }

  async lockUser(qr: QueryRunner, objectType: ObjectType, userId: string): Promise<void> {
    await qr.query(
      `SELECT pg_advisory_xact_lock(hashtext('object_workspace:' || $1), hashtext($2))`,
      [objectType, userId],
    )
  }

  async loadState(
    qr: QueryRunner,
    objectType: ObjectType,
    userId: string,
  ): Promise<ObjectWorkspaceStateRow | null> {
    const rows = await sqlRows<ObjectWorkspaceStateRow[]>(
      qr,
      `SELECT active_view_id, table_state FROM object_workspace_states
       WHERE user_id = $1 AND object_type = $2`,
      [userId, objectType],
    )
    return rows[0] ?? null
  }

  async upsertState(
    qr: QueryRunner,
    objectType: ObjectType,
    userId: string,
    activeViewId: string | null,
    tableState: ObjectTableState,
  ): Promise<void> {
    await qr.query(
      `INSERT INTO object_workspace_states (object_type, user_id, active_view_id, table_state)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, object_type) DO UPDATE SET
         active_view_id = EXCLUDED.active_view_id,
         table_state = EXCLUDED.table_state,
         updated_at = NOW()`,
      [objectType, userId, activeViewId, tableState],
    )
  }
}
