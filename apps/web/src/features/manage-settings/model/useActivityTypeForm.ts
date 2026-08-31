'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { DEFAULT_ACTIVITY_ICON } from '../config/activity-types.constants'
import { HEX_COLOR_PALETTE } from '../config/hex-palette.constants'
import {
  buildActivityTypeFormSchema,
  type ActivityTypeFormSchemaValues,
} from '../lib/activity-type-form.schema'

import type { ActivityTypeFormValues } from '../lib/activity-type-edit'

export function useActivityTypeForm(onSubmit: (values: ActivityTypeFormValues) => void) {
  const { t } = useTranslation()
  const schema = useMemo(() => buildActivityTypeFormSchema(t), [t])
  const submitted = useRef(false)

  const form = useForm<ActivityTypeFormSchemaValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: '',
      icon: DEFAULT_ACTIVITY_ICON,
      color: HEX_COLOR_PALETTE[0] ?? '',
      trackDuration: false,
    },
    mode: 'onChange',
  })

  return {
    control: form.control,
    canSubmit: form.formState.isValid,
    submit: form.handleSubmit((values) => {
      if (submitted.current) return
      submitted.current = true
      onSubmit(values)
    }),
  }
}
