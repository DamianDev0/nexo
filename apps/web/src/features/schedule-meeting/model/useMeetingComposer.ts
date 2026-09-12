'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { t } from 'i18next'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  buildMeetingPayload,
  buildMeetingSchema,
  meetingDefaults,
} from '../lib/meeting-form.schema'
import { meetingDuration } from '../lib/meeting-window'
import { useScheduleMeeting } from '../query/useScheduleMeeting'

import type { MeetingFormValues } from '../lib/meeting-form.schema'

export function useMeetingComposer(contactId: string, onDone: () => void) {
  const schema = useMemo(() => buildMeetingSchema(t), [])
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: meetingDefaults(),
  })
  const { mutate, isPending } = useScheduleMeeting()

  const [startTime, endTime] = useWatch({
    control: form.control,
    name: ['startTime', 'endTime'],
  })

  const submit = form.handleSubmit((values) => {
    mutate(buildMeetingPayload(contactId, values), { onSuccess: onDone })
  })

  return { form, submit, isPending, durationMinutes: meetingDuration(startTime, endTime) }
}
