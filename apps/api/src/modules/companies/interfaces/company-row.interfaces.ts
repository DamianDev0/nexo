// ─── DB row shapes returned by raw SQL queries ───────────────────────────────

export interface CompanyRow {
  id: string
  name: string
  nit: string | null
  nit_dv: string | null
  tax_regime: string | null
  company_size: string | null
  sector_ciiu: string | null
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  department: string | null
  municipio_code: string | null
  tags: string[]
  assigned_to_id: string | null
  custom_fields?: Record<string, unknown>
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ContactRow {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  status: string
  created_at: string
}

export interface DealRow {
  id: string
  title: string
  value_cents: string
  status: string
  stage_id: string | null
  expected_close_date: string | null
  created_at: string
}

export interface StatsRow {
  contact_count: string
  active_deal_count: string
  total_deals_value_cents: string
  invoice_count: string
  total_billed_cents: string
  pending_debt_cents: string
}
