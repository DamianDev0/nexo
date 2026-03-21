export interface MetricsRow {
  total_receivable_cents: string
  total_overdue_cents: string
  active_deals_count: string
  active_deals_value_cents: string
  invoiced_this_month_cents: string
  invoiced_this_month_count: string
  won_deals_this_month_count: string
  won_deals_this_month_value_cents: string
  new_contacts_this_month: string
  pending_activities_count: string
}

export interface PipelineStageSummaryRow {
  pipeline_id: string
  pipeline_name: string
  stage_id: string
  stage_name: string
  stage_color: string
  stage_position: number
  deal_count: string
  total_value_cents: string
}

export interface TodayActivityRow {
  id: string
  activity_type: string
  title: string | null
  due_date: string
  status: string
  contact_name: string | null
  deal_title: string | null
}

export interface OverdueInvoiceRow {
  id: string
  invoice_number: string
  company_name: string | null
  contact_name: string | null
  total_cents: string
  due_date: string
  days_overdue: string
}

export interface TopSalesRepRow {
  user_id: string
  user_name: string
  won_deals_count: string
  total_value_cents: string
}

export interface RevenueByMonthRow {
  month: string
  invoiced_cents: string
  paid_cents: string
  deal_count: string
}
