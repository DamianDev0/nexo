'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { t } from 'i18next'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import {
  activityDefaults,
  buildActivityPayload,
  buildActivitySchema,
} from '../lib/activity-form.schema'
import { useCreateContactActivity } from '../query/useCreateContactActivity'

import type { ActivityFormValues } from '../lib/activity-form.schema'
import type { ContactLogKind } from '@/entities/contact'

export function useActivityComposer(kind: ContactLogKind, contactId: string, onDone: () => void) {
  const schema = useMemo(() => buildActivitySchema(t), [])
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(schema),
    defaultValues: activityDefaults(),
  })
  const { mutate, isPending } = useCreateContactActivity()

  const submit = form.handleSubmit((values) => {
    mutate(buildActivityPayload(kind, contactId, values), { onSuccess: onDone })
  })

  return { form, submit, isPending }
}
