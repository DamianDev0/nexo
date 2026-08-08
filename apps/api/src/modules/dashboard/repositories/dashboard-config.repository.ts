import { Injectable } from '@nestjs/common'
import type { DashboardLayout } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { ConfigRow } from '../interfaces/dashboard-config-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class DashboardConfigRepository {
  constructor(private readonly db: TenantDbService) {}

  async findOrCreate(
    schemaName: string,
    userId: string,
    defaultLayout: DashboardLayout,
  ): Promise<ConfigRow> {
    return this.db.query(schemaName, async (qr): Promise<ConfigRow> => {
      const rows = await sqlRows<ConfigRow[]>(
        qr,
        `SELECT * FROM user_dashboard_configs WHERE user_id = $1`,
        [userId],
      )

      if (rows[0]) return rows[0]

      const inserted = await sqlRows<ConfigRow[]>(
        qr,
        `INSERT INTO user_dashboard_configs (user_id, layout)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO NOTHING
         RETURNING *`,
        [userId, JSON.stringify(defaultLayout)],
      )

      if (inserted[0]) return inserted[0]

      const refetch = await sqlRows<ConfigRow[]>(
        qr,
        `SELECT * FROM user_dashboard_configs WHERE user_id = $1`,
        [userId],
      )
      return refetch[0]!
    })
  }

  async updateLayout(
    schemaName: string,
    userId: string,
    layout: DashboardLayout,
  ): Promise<ConfigRow> {
    return this.db.query(schemaName, async (qr): Promise<ConfigRow> => {
      const rows = await sqlRows<ConfigRow[]>(
        qr,
        `UPDATE user_dashboard_configs
         SET layout = $1, updated_at = NOW()
         WHERE user_id = $2
         RETURNING *`,
        [JSON.stringify(layout), userId],
      )

      return rows[0]!
    })
  }
}
