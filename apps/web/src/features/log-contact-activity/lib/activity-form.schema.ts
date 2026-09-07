import { z } from 'zod'

import {
  ACTIVITY_DEFAULT_TIME,
  ACTIVITY_DESCRIPTION_MAX,
  ACTIVITY_TITLE_MAX,
  BOGOTA_OFFSET_MS,
  BOGOTA_UTC_OFFSET,
} from '../config/activity.constants'

import type { ContactLogKind } from '@/entities/contact'
import type { CreateActivityInput } from '@/shared/api/services/activities.service'
import type { TFunction } from 'i18next'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const CLOCK_TIME = /^([01]\d|2[0-3]):[0-5]\d$/

export function buildActivitySchema(t: TFunction) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, t('contacts.composers.activity.titleRequired'))
      .max(
        ACTIVITY_TITLE_MAX,
        t('contacts.composers.activity.titleTooLong', { max: ACTIVITY_TITLE_MAX }),
      ),
    dueDate: z.string().regex(ISO_DATE, t('contacts.composers.activity.dueDateRequired')),
    time: z.string().regex(CLOCK_TIME, t('contacts.composers.activity.timeInvalid')),
    description: z
      .string()
      .trim()
      .max(
        ACTIVITY_DESCRIPTION_MAX,
        t('contacts.composers.activity.descriptionTooLong', { max: ACTIVITY_DESCRIPTION_MAX }),
      ),
  })
}

export type ActivityFormValues = z.infer<ReturnType<typeof buildActivitySchema>>

export function bogotaToday(now: Date = new Date()): string {
  return new Date(now.getTime() - BOGOTA_OFFSET_MS).toISOString().slice(0, 10)
}

export function activityDefaults(now?: Date): ActivityFormValues {
  return { title: '', dueDate: bogotaToday(now), time: ACTIVITY_DEFAULT_TIME, description: '' }
}

export function toBogotaIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00${BOGOTA_UTC_OFFSET}`).toISOString()
}

export function buildActivityPayload(
  kind: ContactLogKind,
  contactId: string,
  values: ActivityFormValues,
): CreateActivityInput {
  return {
    activityType: kind,
    contactId,
    title: values.title,
    description: values.description.length > 0 ? values.description : undefined,
    dueDate: toBogotaIso(values.dueDate, values.time),
  }
}
