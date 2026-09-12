import { z } from 'zod'

import { bogotaToday, toBogotaIso } from '@/features/log-contact-activity'

import {
  MEETING_ACTIVITY_TYPE,
  MEETING_DEFAULT_END,
  MEETING_DEFAULT_START,
} from '../config/meeting.constants'

import { meetingDuration, reminderIso } from './meeting-window'

import type { CreateActivityInput } from '@/shared/api/services/activities.service'
import type { TFunction } from 'i18next'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const CLOCK_TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const TITLE_MAX = 300
const DESCRIPTION_MAX = 5000

export function buildMeetingSchema(t: TFunction) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, t('contacts.composers.meeting.titleRequired'))
      .max(TITLE_MAX, t('contacts.composers.meeting.titleTooLong', { max: TITLE_MAX })),
    date: z.string().regex(ISO_DATE, t('contacts.composers.meeting.dateRequired')),
    startTime: z.string().regex(CLOCK_TIME, t('contacts.composers.meeting.timeInvalid')),
    endTime: z.string().regex(CLOCK_TIME, t('contacts.composers.meeting.timeInvalid')),
    reminderMinutes: z.number().int().min(0),
    assignedToId: z.string(),
    description: z
      .string()
      .trim()
      .max(DESCRIPTION_MAX, t('contacts.composers.meeting.descriptionTooLong')),
  })
}

export type MeetingFormValues = z.infer<ReturnType<typeof buildMeetingSchema>>

export function meetingDefaults(now?: Date): MeetingFormValues {
  return {
    title: '',
    date: bogotaToday(now),
    startTime: MEETING_DEFAULT_START,
    endTime: MEETING_DEFAULT_END,
    reminderMinutes: 0,
    assignedToId: '',
    description: '',
  }
}

export function buildMeetingPayload(
  contactId: string,
  values: MeetingFormValues,
): CreateActivityInput {
  const dueDate = toBogotaIso(values.date, values.startTime)
  return {
    activityType: MEETING_ACTIVITY_TYPE,
    contactId,
    title: values.title,
    description: values.description.length > 0 ? values.description : undefined,
    dueDate,
    durationMinutes: meetingDuration(values.startTime, values.endTime),
    reminderAt: reminderIso(dueDate, values.reminderMinutes),
    assignedToId: values.assignedToId.length > 0 ? values.assignedToId : undefined,
  }
}
