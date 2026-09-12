import { ACTIVITY_ICON_MAP, FALLBACK_ACTIVITY_ICON } from '../config/activity-icons.constants'

import type { ReactNode } from 'react'

export function activityIconByName(icon: string): ReactNode {
  const Icon = ACTIVITY_ICON_MAP[icon] ?? FALLBACK_ACTIVITY_ICON
  return <Icon />
}
