import type { UpdateActivityDto } from '../dto/activity.dto'

// ─── Updatable fields map: DTO key → SQL column ──────────────────────────────

export const UPDATABLE_FIELDS: [keyof UpdateActivityDto, string][] = [
  ['activityType', 'activity_type'],
  ['title', 'title'],
  ['description', 'description'],
  ['dueDate', 'due_date'],
  ['durationMinutes', 'duration_minutes'],
  ['reminderAt', 'reminder_at'],
  ['contactId', 'contact_id'],
  ['companyId', 'company_id'],
  ['dealId', 'deal_id'],
  ['assignedToId', 'assigned_to_id'],
]

// ─── SQL column selections ───────────────────────────────────────────────────

export const ACTIVITY_LIST_COLUMNS = `
  a.id, a.activity_type, a.title, a.description, a.due_date,
  a.completed_at, a.status, a.duration_minutes, a.reminder_at,
  a.is_active, a.contact_id, a.company_id, a.deal_id,
  a.assigned_to_id, a.created_by, a.created_at, a.updated_at,
  COALESCE(c.first_name || ' ' || c.last_name, c.first_name) AS contact_name,
  co.name AS company_name,
  d.title AS deal_title,
  COALESCE(u.first_name || ' ' || u.last_name, u.email) AS assigned_to_name
`

export const ACTIVITY_LIST_FROM = `
  FROM activities a
  LEFT JOIN contacts c ON c.id = a.contact_id
  LEFT JOIN companies co ON co.id = a.company_id
  LEFT JOIN deals d ON d.id = a.deal_id
  LEFT JOIN users u ON u.id = a.assigned_to_id
`

export const CALENDAR_COLUMNS = `
  a.id, a.activity_type, a.title, a.due_date, a.status,
  COALESCE(c.first_name || ' ' || c.last_name, c.first_name) AS contact_name,
  d.title AS deal_title,
  a.assigned_to_id
`

export const CALENDAR_FROM = `
  FROM activities a
  LEFT JOIN contacts c ON c.id = a.contact_id
  LEFT JOIN deals d ON d.id = a.deal_id
`
