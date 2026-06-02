export interface ContactRow {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  document_type: string | null
  document_number: string | null
  job_title: string | null
  linkedin_url: string | null
  birthday: string | null
  address: string | null
  city: string | null
  department: string | null
  municipio_code: string | null
  country: string | null
  status: string
  lifecycle_stage: string | null
  source: string | null
  lead_score: number
  data_consent: boolean | null
  consent_date: string | null
  consent_source: string | null
  opt_out_email: boolean | null
  opt_out_sms: boolean | null
  opt_out_whatsapp: boolean | null
  last_contacted_at: string | null
  tags: string[]
  company_id: string | null
  assigned_to_id: string | null
  custom_fields?: Record<string, unknown>
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ActivityRow {
  id: string
  activity_type: string
  title: string | null
  description: string | null
  due_date: string | null
  completed_at: string | null
  assigned_to_id: string | null
  created_by: string | null
  created_at: string
}

export interface DealRow {
  id: string
  title: string
  value_cents: number
  status: string
  stage_id: string | null
  pipeline_id: string | null
  expected_close_date: string | null
  created_at: string
}
