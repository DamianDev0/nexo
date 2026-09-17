'use client'

import { t } from 'i18next'

import { useObjectDescriptor, useOptimisticRecordListPatch } from '@/entities/object-descriptor'

import { applyTags, isSameRecord, type RecordTagsChange } from '../lib/apply-record-patch'

import type { RecordBase } from '@/entities/object-descriptor'

export function useAssignRecordTags() {
  const { api } = useObjectDescriptor()
  return useOptimisticRecordListPatch<RecordBase, RecordTagsChange>({
    mutationFn: ({ id, tags }) => api.update(id, { tags: [...tags] }),
    patch: applyTags,
    match: isSameRecord,
    successTitle: () => t('records.toasts.tagsUpdated'),
  })
}
