'use client'

import { t } from 'i18next'
import { useCallback } from 'react'

import { useObjectDescriptor, useOptimisticRecordListPatch } from '@/entities/object-descriptor'

import {
  applyCustomFields,
  isSameRecord,
  type RecordCustomFieldsChange,
} from '../lib/apply-record-patch'

import type { RecordBase } from '@/entities/object-descriptor'

export function useEditRecordCustomFields() {
  const { api } = useObjectDescriptor()
  const mutate = useOptimisticRecordListPatch<RecordBase, RecordCustomFieldsChange>({
    mutationFn: ({ id, customFields }) => api.update(id, { customFields }),
    patch: applyCustomFields,
    match: isSameRecord,
    successTitle: () => t('records.toasts.fieldUpdated'),
  })

  return useCallback(
    (id: string, customFields: Record<string, unknown>) => mutate({ id, customFields }),
    [mutate],
  )
}
