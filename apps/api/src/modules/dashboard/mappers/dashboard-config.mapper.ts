import type { UserDashboardConfig } from '@repo/shared-types'
import type { ConfigRow } from '../interfaces/dashboard-config-row.interfaces'

export function mapConfig(r: ConfigRow): UserDashboardConfig {
  return {
    userId: r.user_id,
    layout: r.layout,
    updatedAt: r.updated_at,
  }
}
