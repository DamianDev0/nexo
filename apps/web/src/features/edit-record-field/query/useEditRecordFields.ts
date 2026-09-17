'use client'

import { t } from 'i18next'
import { useCallback } from 'react'

import { useObjectDescriptor, useOptimisticRecordListPatch } from '@/entities/object-descriptor'

import { applyFields, isSameRecord, type RecordFieldsChange } from '../lib/apply-record-patch'

import type { RecordBase } from '@/entities/object-descriptor'

export function useEditRecordFields<TPatch extends object>() {
  const { api } = useObjectDescriptor()
  const mutate = useOptimisticRecordListPatch<RecordBase, RecordFieldsChange>({
    mutationFn: ({ id, patch }) => api.update(id, patch),
    patch: applyFields,
    match: isSameRecord,
    successTitle: () => t('records.toasts.fieldUpdated'),
  })

  return useCallback(
    (id: string, patch: TPatch) => mutate({ id, patch: patch as Record<string, unknown> }),
    [mutate],
  )
}
