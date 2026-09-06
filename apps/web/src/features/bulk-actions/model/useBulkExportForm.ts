'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  buildExportFormSchema,
  exportFormDefaults,
  toExportParams,
  type ExportFormValues,
} from '../lib/export-form.schema'

import type { BulkExportParams, CustomFieldEntity } from '@repo/shared-types'

export function useBulkExportForm(
  onConfirm: (params: BulkExportParams) => void,
  entity: CustomFieldEntity = 'contacts',
) {
  const { t } = useTranslation()
  const form = useForm<ExportFormValues>({
    resolver: zodResolver(buildExportFormSchema(t)),
    defaultValues: exportFormDefaults(entity),
  })

  const handleSubmit = form.handleSubmit((values) => onConfirm(toExportParams(values)))

  return { form, handleSubmit }
}
