'use client'

import { t } from 'i18next'
import { useCallback } from 'react'

import { useObjectDescriptor, useOptimisticRecordListPatch } from '@/entities/object-descriptor'

import { applyStatus, isSameRecord, type RecordStatusChange } from '../lib/apply-record-patch'

import type { RecordBase } from '@/entities/object-descriptor'

export function useChangeRecordStatus() {
  const { api } = useObjectDescriptor()
  const mutate = useOptimisticRecordListPatch<RecordBase, RecordStatusChange>({
    mutationFn: ({ id, status }) => api.update(id, { status }),
    patch: applyStatus,
    match: isSameRecord,
    successTitle: () => t('records.toasts.statusUpdated'),
  })

  return useCallback((id: string, status: string) => mutate({ id, status }), [mutate])
}
