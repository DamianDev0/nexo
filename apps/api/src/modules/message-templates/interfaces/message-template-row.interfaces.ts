export interface TemplateRow {
  id: string
  name: string
  channel: string
  format: string
  subject: string | null
  body: string
  variables: string[]
  category: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface TemplateListResult {
  rows: TemplateRow[]
  total: number
}

export interface TemplateInsertValues {
  name: string
  channel: string
  format: string
  subject: string | null
  body: string
  variables: string[]
  category: string | null
  createdBy: string
}
