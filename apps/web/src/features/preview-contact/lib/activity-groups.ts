import { activityKindKey } from '@/entities/activity'

import type { ContactActivity } from '@repo/shared-types'

export type ActivityGroups = {
  readonly all: ReadonlyArray<ContactActivity>
  readonly notes: ReadonlyArray<ContactActivity>
  readonly tasks: ReadonlyArray<ContactActivity>
  readonly meetings: ReadonlyArray<ContactActivity>
}

function ofKind(activities: ReadonlyArray<ContactActivity>, kind: string) {
  return activities.filter((activity) => activityKindKey(activity.activityType) === kind)
}

export function groupContactActivities(activities: ReadonlyArray<ContactActivity>): ActivityGroups {
  return {
    all: activities,
    notes: ofKind(activities, 'note'),
    tasks: ofKind(activities, 'task'),
    meetings: ofKind(activities, 'meeting'),
  }
}
