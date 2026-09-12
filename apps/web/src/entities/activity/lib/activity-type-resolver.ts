import { DEFAULT_ACTIVITY_ICON } from '../config/activity-icons.constants'

import type { ActivityTypeDef } from '@repo/shared-types'

export type ResolvedActivityType = {
  readonly key: string
  readonly label: string
  readonly icon: string
  readonly color: string | null
  readonly trackDuration: boolean
  readonly known: boolean
}

export function resolveActivityType(
  activityType: string,
  catalog: ReadonlyArray<ActivityTypeDef>,
): ResolvedActivityType {
  const key = activityType.toLowerCase()
  const match = catalog.find((type) => type.key.toLowerCase() === key)
  if (!match) {
    return {
      key,
      label: activityType,
      icon: DEFAULT_ACTIVITY_ICON,
      color: null,
      trackDuration: false,
      known: false,
    }
  }
  return {
    key: match.key,
    label: match.label,
    icon: match.icon,
    color: match.color,
    trackDuration: match.trackDuration,
    known: true,
  }
}

export function activityTypeByKey(
  catalog: ReadonlyArray<ActivityTypeDef>,
): ReadonlyMap<string, ActivityTypeDef> {
  return new Map(catalog.map((type) => [type.key.toLowerCase(), type]))
}
