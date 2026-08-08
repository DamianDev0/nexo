import type {
  Activity,
  ActivityListItem,
  ActivityStatus,
  CalendarActivity,
} from '@repo/shared-types'
import type {
  ActivityListRow,
  ActivityRow,
  CalendarRow,
} from '../interfaces/activity-row.interfaces'

export function mapActivity(r: ActivityRow): Activity {
  return {
    id: r.id,
    activityType: r.activity_type,
    title: r.title,
    description: r.description,
    dueDate: r.due_date,
    completedAt: r.completed_at,
    status: r.status as ActivityStatus,
    durationMinutes: r.duration_minutes,
    reminderAt: r.reminder_at,
    isActive: r.is_active,
    contactId: r.contact_id,
    companyId: r.company_id,
    dealId: r.deal_id,
    assignedToId: r.assigned_to_id,
    createdById: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export function mapActivityListItem(r: ActivityListRow): ActivityListItem {
  return {
    ...mapActivity(r),
    contactName: r.contact_name,
    companyName: r.company_name,
    dealTitle: r.deal_title,
    assignedToName: r.assigned_to_name,
  }
}

export function mapCalendarActivity(r: CalendarRow): CalendarActivity {
  return {
    id: r.id,
    activityType: r.activity_type,
    title: r.title,
    dueDate: r.due_date,
    status: r.status as ActivityStatus,
    contactName: r.contact_name,
    dealTitle: r.deal_title,
    assignedToId: r.assigned_to_id,
  }
}
