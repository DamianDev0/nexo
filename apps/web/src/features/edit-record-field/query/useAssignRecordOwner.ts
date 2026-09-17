'use client'

import { t } from 'i18next'

import { useObjectDescriptor, useOptimisticRecordListPatch } from '@/entities/object-descriptor'

import { applyOwner, isSameRecord, type RecordOwnerChange } from '../lib/apply-record-patch'

import type { RecordBase } from '@/entities/object-descriptor'

export function useAssignRecordOwner() {
  const { api } = useObjectDescriptor()
  return useOptimisticRecordListPatch<RecordBase, RecordOwnerChange>({
    mutationFn: ({ id, assignedToId }) => api.update(id, { assignedToId }),
    patch: applyOwner,
    match: isSameRecord,
    successTitle: () => t('records.toasts.ownerUpdated'),
  })
}
