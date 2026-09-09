import type { ActivityDueFilter } from '@repo/shared-types'

export interface ActivityRow {
  id: string
  activity_type: string
  title: string | null
  description: string | null
  due_date: string | null
  completed_at: string | null
  status: string
  priority: string
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

export interface ActivityListFilters {
  activityType?: string
  status?: string
  due?: ActivityDueFilter
  contactId?: string
  companyId?: string
  dealId?: string
  assignedToId?: string
}

export interface ActivityListPage {
  rows: ActivityListRow[]
  total: number
}

export interface ActivityInsertValues {
  activityType: string
  title: string | null
  description: string | null
  dueDate: string | null
  durationMinutes: number | null
  reminderAt: string | null
  priority: string
  contactId: string | null
  companyId: string | null
  dealId: string | null
  assignedToId: string
  createdById: string
  completed: boolean
}
