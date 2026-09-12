import { formatDateCO } from '@repo/shared-utils'

import { isActivityCompleted, isActivityOverdue } from '@/entities/activity'

import type { ContactActivity } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export const CLAMPED_LENGTH = 110

export type ActivityDueLabel = {
  readonly label: string
  readonly overdue: boolean
}

export function isExpandableText(text: string | null | undefined): boolean {
  return (text?.length ?? 0) > CLAMPED_LENGTH
}

export function activityDue(t: TFunction, activity: ContactActivity): ActivityDueLabel | null {
  if (activity.dueDate === null || isActivityCompleted(activity)) return null

  const overdue = isActivityOverdue(activity)
  return {
    overdue,
    label: t(overdue ? 'contacts.preview.tasks.overdue' : 'contacts.preview.due', {
      when: formatDateCO(activity.dueDate),
    }),
  }
}
