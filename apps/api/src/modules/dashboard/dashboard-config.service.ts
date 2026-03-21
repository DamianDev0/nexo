import { Injectable } from '@nestjs/common'
import type { DashboardLayout, DashboardWidget, UserDashboardConfig } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'

interface ConfigRow {
  id: string
  user_id: string
  layout: DashboardLayout
  created_at: string
  updated_at: string
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: 'w1',
    type: 'kpi_active_deals',
    title: 'Active Deals',
    size: '1x1',
    position: 0,
    visible: true,
    config: {},
  },
  {
    id: 'w2',
    type: 'kpi_won_deals',
    title: 'Won This Month',
    size: '1x1',
    position: 1,
    visible: true,
    config: {},
  },
  {
    id: 'w3',
    type: 'kpi_new_contacts',
    title: 'New Contacts',
    size: '1x1',
    position: 2,
    visible: true,
    config: {},
  },
  {
    id: 'w4',
    type: 'kpi_pending_activities',
    title: 'Pending Activities',
    size: '1x1',
    position: 3,
    visible: true,
    config: {},
  },
  {
    id: 'w5',
    type: 'kpi_receivable',
    title: 'Receivable',
    size: '1x1',
    position: 4,
    visible: true,
    config: {},
  },
  {
    id: 'w6',
    type: 'kpi_overdue',
    title: 'Overdue',
    size: '1x1',
    position: 5,
    visible: true,
    config: {},
  },
  {
    id: 'w7',
    type: 'pipeline_summary',
    title: 'Pipeline',
    size: '2x2',
    position: 6,
    visible: true,
    config: {},
  },
  {
    id: 'w8',
    type: 'today_activities',
    title: 'Today',
    size: '2x1',
    position: 7,
    visible: true,
    config: {},
  },
  {
    id: 'w9',
    type: 'revenue_by_month',
    title: 'Revenue Trend',
    size: '2x1',
    position: 8,
    visible: true,
    config: {},
  },
  {
    id: 'w10',
    type: 'top_sales_reps',
    title: 'Top Reps',
    size: '1x1',
    position: 9,
    visible: true,
    config: {},
  },
  {
    id: 'w11',
    type: 'overdue_invoices',
    title: 'Overdue Invoices',
    size: '2x1',
    position: 10,
    visible: false,
    config: {},
  },
  {
    id: 'w12',
    type: 'deal_forecast',
    title: 'Forecast',
    size: '2x1',
    position: 11,
    visible: false,
    config: {},
  },
  {
    id: 'w13',
    type: 'recent_deals',
    title: 'Recent Deals',
    size: '2x1',
    position: 12,
    visible: false,
    config: {},
  },
  {
    id: 'w14',
    type: 'recent_contacts',
    title: 'Recent Contacts',
    size: '2x1',
    position: 13,
    visible: false,
    config: {},
  },
  {
    id: 'w15',
    type: 'low_stock_alert',
    title: 'Low Stock',
    size: '1x1',
    position: 14,
    visible: false,
    config: {},
  },
]

const DEFAULT_LAYOUT: DashboardLayout = {
  widgets: DEFAULT_WIDGETS,
  columns: 3,
  refreshIntervalSeconds: 300,
}

@Injectable()
export class DashboardConfigService {
  constructor(private readonly db: TenantDbService) {}

  async getConfig(schemaName: string, userId: string): Promise<UserDashboardConfig> {
    return this.db.query(schemaName, async (qr): Promise<UserDashboardConfig> => {
      const rows: ConfigRow[] = await qr.query(
        `SELECT * FROM user_dashboard_configs WHERE user_id = $1`,
        [userId],
      )

      if (rows[0]) return this.map(rows[0])

      const inserted: ConfigRow[] = await qr.query(
        `INSERT INTO user_dashboard_configs (user_id, layout)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO NOTHING
         RETURNING *`,
        [userId, JSON.stringify(DEFAULT_LAYOUT)],
      )

      if (inserted[0]) return this.map(inserted[0])

      const refetch: ConfigRow[] = await qr.query(
        `SELECT * FROM user_dashboard_configs WHERE user_id = $1`,
        [userId],
      )
      return this.map(refetch[0]!)
    })
  }

  async updateLayout(
    schemaName: string,
    userId: string,
    layout: DashboardLayout,
  ): Promise<UserDashboardConfig> {
    return this.db.query(schemaName, async (qr): Promise<UserDashboardConfig> => {
      await this.getConfig(schemaName, userId)

      const rows: ConfigRow[] = await qr.query(
        `UPDATE user_dashboard_configs
         SET layout = $1, updated_at = NOW()
         WHERE user_id = $2
         RETURNING *`,
        [JSON.stringify(layout), userId],
      )

      return this.map(rows[0]!)
    })
  }

  async toggleWidget(
    schemaName: string,
    userId: string,
    widgetId: string,
    visible: boolean,
  ): Promise<UserDashboardConfig> {
    const config = await this.getConfig(schemaName, userId)
    const widget = config.layout.widgets.find((w) => w.id === widgetId)
    if (widget) widget.visible = visible
    return this.updateLayout(schemaName, userId, config.layout)
  }

  async reorderWidgets(
    schemaName: string,
    userId: string,
    widgetIds: string[],
  ): Promise<UserDashboardConfig> {
    const config = await this.getConfig(schemaName, userId)
    const widgetMap = new Map(config.layout.widgets.map((w) => [w.id, w]))

    config.layout.widgets = widgetIds
      .map((id, i) => {
        const w = widgetMap.get(id)
        if (w) w.position = i
        return w
      })
      .filter((w): w is DashboardWidget => w !== undefined)

    const remaining = config.layout.widgets
      .filter((w) => !widgetIds.includes(w.id))
      .map((w, i) => ({ ...w, position: widgetIds.length + i }))

    config.layout.widgets = [...config.layout.widgets, ...remaining]
    return this.updateLayout(schemaName, userId, config.layout)
  }

  async resetToDefault(schemaName: string, userId: string): Promise<UserDashboardConfig> {
    return this.updateLayout(schemaName, userId, DEFAULT_LAYOUT)
  }

  private map(r: ConfigRow): UserDashboardConfig {
    return {
      userId: r.user_id,
      layout: r.layout,
      updatedAt: r.updated_at,
    }
  }
}
