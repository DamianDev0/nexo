import { z } from 'zod'

import { NOTE_BODY_MAX, NOTE_TITLE_MAX } from '../config/note.constants'

import type { CreateActivityInput } from '@/shared/api/services/activities.service'
import type { TFunction } from 'i18next'

export function buildNoteSchema(t: TFunction) {
  return z.object({
    body: z
      .string()
      .trim()
      .min(1, t('contacts.composers.note.bodyRequired'))
      .max(NOTE_BODY_MAX, t('contacts.composers.note.bodyTooLong', { max: NOTE_BODY_MAX })),
  })
}

export type NoteFormValues = z.infer<ReturnType<typeof buildNoteSchema>>

export function buildNotePayload(contactId: string, body: string): CreateActivityInput {
  const firstLine = body.split('\n', 1)[0] ?? body
  return {
    activityType: 'note',
    contactId,
    title: firstLine.slice(0, NOTE_TITLE_MAX),
    description: body,
  }
}
