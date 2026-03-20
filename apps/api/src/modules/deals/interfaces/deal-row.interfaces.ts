// ─── DB row shapes returned by raw SQL queries ───────────────────────────────
// value_cents is BIGINT → node-postgres returns it as string
// stage_probability / stage_position are INTEGER → returned as number

export interface DealListRow {
  id: string
  title: string
  value_cents: string
  expected_close_date: string | null
  stage_id: string | null
  stage_name: string | null
  stage_color: string | null
  stage_probability: number | null
  stage_position: number | null
  pipeline_id: string | null
  pipeline_name: string | null
  contact_id: string | null
  company_id: string | null
  assigned_to_id: string | null
  loss_reason: string | null
  status: string
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface DealDetailRow extends DealListRow {
  custom_fields: Record<string, unknown>
  contact_first_name: string | null
  contact_last_name: string | null
  contact_email: string | null
  contact_phone: string | null
  company_name: string | null
  company_nit: string | null
}

export interface DealItemRow {
  id: string
  deal_id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price_cents: string // BIGINT → string
  discount_percent: number
  iva_rate: number
  position: number
  created_at: string
}

export interface StageHistoryRow {
  id: string
  deal_id: string
  from_stage_id: string | null
  to_stage_id: string | null
  from_status: string | null
  to_status: string | null
  changed_by: string | null
  changed_at: string
}

export interface ForecastRow {
  month: string
  total_value_cents: string
  weighted_value_cents: string
  deal_count: string
}
