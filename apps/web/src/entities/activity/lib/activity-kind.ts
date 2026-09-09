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

export type ActivityLike = {
  readonly activityType: string
  readonly title: string | null
  readonly description: string | null
  readonly completedAt: string | null
}

export function activityKindKey(activityType: string): ActivityKindKey {
  const key = activityType.toLowerCase()
  return (ACTIVITY_KIND_KEYS as ReadonlyArray<string>).includes(key)
    ? (key as ActivityKindKey)
    : 'other'
}

export function activityPreview(activity: Pick<ActivityLike, 'title' | 'description'>): string {
  if (activity.title) return activity.title
  const firstLine = activity.description?.split('\n', 1)[0]
  return firstLine ?? ''
}

export function isActivityCompleted(activity: Pick<ActivityLike, 'completedAt'>): boolean {
  return activity.completedAt !== null
}
