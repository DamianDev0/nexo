import { Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import type { ContactTableState } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { WorkspaceStateRow } from '../interfaces/contact-workspace-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class ContactWorkspaceRepository {
  constructor(private readonly db: TenantDbService) {}

  async findState(schemaName: string, userId: string): Promise<WorkspaceStateRow | null> {
    return this.db.query(schemaName, async (qr) => this.loadState(qr, userId))
  }

  async loadState(qr: QueryRunner, userId: string): Promise<WorkspaceStateRow | null> {
    const rows = await sqlRows<WorkspaceStateRow[]>(
      qr,
      `SELECT active_view_id, table_state FROM contact_workspace_states WHERE user_id = $1`,
      [userId],
    )
    return rows[0] ?? null
  }

  async upsertState(
    qr: QueryRunner,
    userId: string,
    activeViewId: string | null,
    tableState: ContactTableState,
  ): Promise<void> {
    await qr.query(
      `INSERT INTO contact_workspace_states (user_id, active_view_id, table_state)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET
         active_view_id = EXCLUDED.active_view_id,
         table_state = EXCLUDED.table_state,
         updated_at = NOW()`,
      [userId, activeViewId, tableState],
    )
  }
}
