import type { ActivityStatus } from '@repo/shared-types'

export type ActivityDue = {
  readonly dueDate: string | null
  readonly status: ActivityStatus
}

export function isActivityOverdue(activity: ActivityDue, now: number = Date.now()): boolean {
  if (activity.status !== 'pending' || activity.dueDate === null) return false
  return new Date(activity.dueDate).getTime() < now
}

export function isActivityToggleable(activityType: string): boolean {
  const kind = activityType.toLowerCase()
  return kind === 'task' || kind === 'meeting'
}
