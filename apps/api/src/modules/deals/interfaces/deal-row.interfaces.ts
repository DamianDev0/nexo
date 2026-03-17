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
