export interface ActivityRow {
  id: string
  activity_type: string
  title: string | null
  description: string | null
  due_date: string | null
  completed_at: string | null
  status: string
  duration_minutes: number | null
  reminder_at: string | null
  is_active: boolean
  contact_id: string | null
  company_id: string | null
  deal_id: string | null
  assigned_to_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ActivityListRow extends ActivityRow {
  contact_name: string | null
  company_name: string | null
  deal_title: string | null
  assigned_to_name: string | null
}

export interface CalendarRow {
  id: string
  activity_type: string
  title: string | null
  due_date: string
  status: string
  contact_name: string | null
  deal_title: string | null
  assigned_to_id: string | null
}
