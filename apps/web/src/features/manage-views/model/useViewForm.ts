'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { buildViewFormSchema, type ViewFormValues } from '../lib/view-form.schema'

type ViewFormArgs = {
  readonly initial: ViewFormValues
  readonly onSave: (values: ViewFormValues) => void
  readonly onDone: () => void
}

export function useViewForm({ initial, onSave, onDone }: ViewFormArgs) {
  const { t } = useTranslation()
  const form = useForm<ViewFormValues>({
    resolver: zodResolver(buildViewFormSchema(t)),
    defaultValues: initial,
  })

  const handleSubmit = form.handleSubmit((values) => {
    onSave(values)
    onDone()
  })

  return { form, handleSubmit }
}
