'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { EMPTY_OPTION_FORM } from '../config/option-form.constants'
import { buildOptionFormSchema, type OptionFormSchemaValues } from '../lib/option-form.schema'

import type { OptionFormValues } from './types'

interface UseOptionFormArgs {
  readonly initial: OptionFormValues | null
  readonly onSubmit: (values: OptionFormValues) => void
  readonly onClose: () => void
}

export function useOptionForm({ initial, onSubmit, onClose }: UseOptionFormArgs) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildOptionFormSchema(t), [t])

  const form = useForm<OptionFormSchemaValues>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? EMPTY_OPTION_FORM,
    mode: 'onChange',
  })

  const { reset } = form

  useEffect(() => {
    reset(initial ?? EMPTY_OPTION_FORM)
  }, [initial, reset])

  return {
    control: form.control,
    descriptionLength: form.watch('description').length,
    canSubmit: form.formState.isValid,
    submit: form.handleSubmit((values) => {
      onSubmit(values)
      onClose()
    }),
  }
}
