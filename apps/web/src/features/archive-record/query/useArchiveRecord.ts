'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import { useObjectDescriptor } from '@/entities/object-descriptor'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'

import type { RecordBase } from '@/entities/object-descriptor'

export function useArchiveRecord(onArchived?: () => void) {
  const { t } = useTranslation()
  const descriptor = useObjectDescriptor()
  const client = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: (record: RecordBase) => descriptor.api.archive(record.id),
    onSuccess: (_data, record) => {
      sileo.success({
        title: t('records.archive.done', { name: descriptor.displayName(record) }),
      })
      void descriptor.invalidateRecords(client, record.id)
      onArchived?.()
    },
    onError: (error: { message?: string }) => notifySaveFailed(error),
  })

  return {
    archive: useCallback((record: RecordBase) => mutate(record), [mutate]),
    isPending,
  }
}
