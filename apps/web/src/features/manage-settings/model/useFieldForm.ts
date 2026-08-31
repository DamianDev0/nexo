'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useRef } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { fieldHasOptions } from '../lib/custom-field-edit'
import { buildFieldFormSchema, type FieldFormSchemaValues } from '../lib/field-form.schema'

import type { FieldFormValues } from '../lib/custom-field-edit'

export type FieldOptionItem = { id: string; value: string }

function toFieldValues(values: FieldFormSchemaValues): FieldFormValues {
  return {
    label: values.label,
    type: values.type,
    required: values.required,
    showInForm: values.showInForm,
    optionLabels: values.options.map((option) => option.value.trim()).filter(Boolean),
  }
}

export function useFieldForm(
  initial: FieldFormValues | null,
  onSubmit: (values: FieldFormValues) => void,
) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildFieldFormSchema(t), [t])
  const submitted = useRef(false)

  const form = useForm<FieldFormSchemaValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: initial?.label ?? '',
      type: initial?.type ?? 'text',
      required: initial?.required ?? false,
      showInForm: initial?.showInForm ?? true,
      options: (initial?.optionLabels ?? []).map((value) => ({ value })),
    },
    mode: 'onChange',
  })

  const optionsArray = useFieldArray({ control: form.control, name: 'options' })
  const watchedOptions = form.watch('options')
  const type = form.watch('type')

  const options: ReadonlyArray<FieldOptionItem> = optionsArray.fields.map((field, index) => ({
    id: field.id,
    value: watchedOptions[index]?.value ?? '',
  }))

  const optionActions = useMemo(
    () => ({
      onAdd: () => optionsArray.append({ value: '' }),
      onChange: (id: string, value: string) => {
        const index = optionsArray.fields.findIndex((field) => field.id === id)
        if (index >= 0) form.setValue(`options.${index}.value`, value, { shouldValidate: true })
      },
      onRemove: (id: string) => {
        const index = optionsArray.fields.findIndex((field) => field.id === id)
        if (index >= 0) optionsArray.remove(index)
      },
    }),
    [form, optionsArray],
  )

  return {
    control: form.control,
    type,
    hasOptions: fieldHasOptions(type),
    options,
    optionActions,
    optionsError: form.formState.errors.options?.message,
    canSubmit: form.formState.isValid,
    isEdit: initial !== null,
    submit: form.handleSubmit((values) => {
      if (submitted.current) return
      submitted.current = true
      onSubmit(toFieldValues(values))
    }),
  }
}
