import type {
  ConsentChannel,
  ContactNextActivity,
  ContactSortField,
  FilterCondition,
} from '@repo/shared-types'

export interface ContactRow {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  document_type: string | null
  document_number: string | null
  avatar_url: string | null
  city: string | null
  municipio_code: string | null
  status: string
  status_changed_at: string | null
  lifecycle_stage: string | null
  source: string | null
  last_contacted_at: string | null
  tags: string[]
  company_id: string | null
  assigned_to_id: string | null
  custom_fields?: Record<string, unknown>
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  note_count?: number
  opted_out_channels?: ConsentChannel[]
  assigned_to_name?: string | null
  next_activity?: ContactNextActivity | null
}

export interface ActivityRow {
  id: string
  activity_type: string
  title: string | null
  description: string | null
  due_date: string | null
  completed_at: string | null
  status: string
  priority: string
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

export interface ContactListQuery {
  q?: string
  advanced?: FilterCondition[]
  status?: string
  source?: string
  tags?: string[]
  companyId?: string
  assignedToId?: string
  lifecycleStage?: string
  city?: string
  createdFrom?: string
  createdTo?: string
  lastContactedFrom?: string
  lastContactedTo?: string
  archived?: boolean
  sortBy?: ContactSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ContactPage {
  rows: ContactRow[]
  total: number
  page: number
  limit: number
}

export interface ContactStatusCountRow {
  status: string
  count: string
}

export interface TaxonomyUsageCountRow {
  key: string
  count: string
}

export interface CreateContactData {
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  documentType: string | null
  documentNumber: string | null
  avatarUrl: string | null
  city: string | null
  municipioCode: string | null
  status: string
  lifecycleStage: string
  source: string | null
  tags: string[]
  companyId: string | null
  assignedToId: string | null
  customFields: Record<string, unknown>
  createdBy: string
}

export interface ContactColumnChange {
  column: string
  value: unknown
}
