export type WidgetSize = '1x1' | '2x1' | '1x2' | '2x2' | 'full'

export type WidgetType =
  | 'kpi_receivable'
  | 'kpi_overdue'
  | 'kpi_active_deals'
  | 'kpi_invoiced_month'
  | 'kpi_won_deals'
  | 'kpi_new_contacts'
  | 'kpi_pending_activities'
  | 'pipeline_summary'
  | 'today_activities'
  | 'overdue_invoices'
  | 'top_sales_reps'
  | 'revenue_by_month'
  | 'deal_forecast'
  | 'recent_deals'
  | 'recent_contacts'
  | 'low_stock_alert'

export type DashboardWidget = {
  id: string
  type: WidgetType
  title: string
  size: WidgetSize
  position: number
  visible: boolean
  config: Record<string, unknown>
}

export type DashboardLayout = {
  widgets: DashboardWidget[]
  columns: number
  refreshIntervalSeconds: number
}

export type UserDashboardConfig = {
  userId: string
  layout: DashboardLayout
  updatedAt: string
}
