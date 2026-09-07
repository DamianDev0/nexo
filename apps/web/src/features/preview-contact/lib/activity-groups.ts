import type { ContactActivity } from '@repo/shared-types'

export const ACTIVITY_KIND_KEYS = [
  'call',
  'meeting',
  'email',
  'task',
  'note',
  'whatsapp',
  'sms',
] as const

export type ActivityKindKey = (typeof ACTIVITY_KIND_KEYS)[number] | 'other'

export type ActivityGroups = {
  readonly all: ReadonlyArray<ContactActivity>
  readonly notes: ReadonlyArray<ContactActivity>
  readonly tasks: ReadonlyArray<ContactActivity>
  readonly meetings: ReadonlyArray<ContactActivity>
}

export function activityKindKey(activityType: string): ActivityKindKey {
  const key = activityType.toLowerCase()
  return (ACTIVITY_KIND_KEYS as ReadonlyArray<string>).includes(key)
    ? (key as ActivityKindKey)
    : 'other'
}

export function groupContactActivities(activities: ReadonlyArray<ContactActivity>): ActivityGroups {
  return {
    all: activities,
    notes: activities.filter((activity) => activityKindKey(activity.activityType) === 'note'),
    tasks: activities.filter((activity) => activityKindKey(activity.activityType) === 'task'),
    meetings: activities.filter((activity) => activityKindKey(activity.activityType) === 'meeting'),
  }
}

export function activityPreview(activity: ContactActivity): string {
  if (activity.title) return activity.title
  const firstLine = activity.description?.split('\n', 1)[0]
  return firstLine ?? ''
}

export function isActivityCompleted(activity: ContactActivity): boolean {
  return activity.completedAt !== null
}
