'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import { useObjectDescriptor } from '@/entities/object-descriptor'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'

import type { RecordBase } from '@/entities/object-descriptor'

export function useRestoreRecord() {
  const { t } = useTranslation()
  const descriptor = useObjectDescriptor()
  const client = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: (record: RecordBase) => descriptor.api.restore(record.id),
    onSuccess: (_data, record) => {
      sileo.success({
        title: t('records.toasts.restored', { name: descriptor.displayName(record) }),
      })
      void descriptor.invalidateRecords(client, record.id)
    },
    onError: (error: { message?: string }) => notifySaveFailed(error),
  })

  return useCallback((record: RecordBase) => mutate(record), [mutate])
}
