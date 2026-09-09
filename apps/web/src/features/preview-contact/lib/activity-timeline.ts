import { toBogotaDayKey } from '@repo/shared-utils'

import { activityKindKey } from '@/entities/activity'

import type { ActivityKindKey } from '@/entities/activity'
import type { ContactActivity } from '@repo/shared-types'

export const ACTIVITY_TIMELINE_FILTERS = ['all', 'calls', 'messages', 'notes', 'tasks'] as const

export type ActivityTimelineFilter = (typeof ACTIVITY_TIMELINE_FILTERS)[number]

const FILTER_KINDS: Readonly<
  Record<ActivityTimelineFilter, ReadonlyArray<ActivityKindKey> | null>
> = {
  all: null,
  calls: ['call'],
  messages: ['email', 'sms', 'whatsapp'],
  notes: ['note'],
  tasks: ['task', 'meeting'],
}

export type ActivityDay = {
  readonly day: string
  readonly items: ReadonlyArray<ContactActivity>
}

export function filterActivities(
  activities: ReadonlyArray<ContactActivity>,
  filter: ActivityTimelineFilter,
): ReadonlyArray<ContactActivity> {
  const kinds = FILTER_KINDS[filter]
  if (kinds === null) return activities
  return activities.filter((activity) => kinds.includes(activityKindKey(activity.activityType)))
}

export function groupActivitiesByDay(
  activities: ReadonlyArray<ContactActivity>,
): ReadonlyArray<ActivityDay> {
  const days: ActivityDay[] = []
  for (const activity of activities) {
    const day = toBogotaDayKey(activity.createdAt)
    const last = days.at(-1)
    if (last?.day === day) days[days.length - 1] = { day, items: [...last.items, activity] }
    else days.push({ day, items: [activity] })
  }
  return days
}

export function relativeDayKey(day: string, now: Date = new Date()): 'today' | 'yesterday' | null {
  const today = toBogotaDayKey(now)
  if (day === today) return 'today'
  const yesterday = toBogotaDayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000))
  return day === yesterday ? 'yesterday' : null
}
