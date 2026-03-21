export type ActivityStatus = 'pending' | 'completed' | 'cancelled'

export type Activity = {
  id: string
  activityType: string
  title: string | null
  description: string | null
  dueDate: string | null
  completedAt: string | null
  status: ActivityStatus
  durationMinutes: number | null
  reminderAt: string | null
  isActive: boolean
  contactId: string | null
  companyId: string | null
  dealId: string | null
  assignedToId: string | null
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export type ActivityListItem = Activity & {
  contactName: string | null
  companyName: string | null
  dealTitle: string | null
  assignedToName: string | null
}

export type PaginatedActivities = {
  data: ActivityListItem[]
  total: number
  page: number
  limit: number
}

export type CalendarActivity = {
  id: string
  activityType: string
  title: string | null
  dueDate: string
  status: ActivityStatus
  contactName: string | null
  dealTitle: string | null
  assignedToId: string | null
}
