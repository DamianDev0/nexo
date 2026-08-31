'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { buildPipelineFormSchema, type PipelineFormValues } from '../lib/pipeline-form.schema'

export function usePipelineForm(onSubmit: (name: string) => void) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildPipelineFormSchema(t), [t])
  const submitted = useRef(false)

  const form = useForm<PipelineFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
    mode: 'onChange',
  })

  return {
    control: form.control,
    canSubmit: form.formState.isValid,
    submit: form.handleSubmit((values) => {
      if (submitted.current) return
      submitted.current = true
      onSubmit(values.name)
    }),
  }
}
