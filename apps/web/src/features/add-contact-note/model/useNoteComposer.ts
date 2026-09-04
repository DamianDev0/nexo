'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { t } from 'i18next'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { NOTE_BODY_MAX } from '../config/note.constants'
import { buildNotePayload, buildNoteSchema } from '../lib/note-form.schema'
import { useCreateContactNote } from '../query/useCreateContactNote'

import type { NoteFormValues } from '../lib/note-form.schema'

export function useNoteComposer(contactId: string, onDone: () => void) {
  const schema = useMemo(() => buildNoteSchema(t), [])
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { body: '' },
  })
  const { mutate, isPending } = useCreateContactNote()

  const submit = form.handleSubmit((values) => {
    mutate(buildNotePayload(contactId, values.body), { onSuccess: onDone })
  })

  const bodyLength = form.watch('body').length

  return { form, submit, isPending, bodyLength, bodyMax: NOTE_BODY_MAX }
}
