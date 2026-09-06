'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import bulkActionsService from '@/shared/api/services/bulk-actions.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { CreateBulkActionInput } from '@repo/shared-types'

export function useCreateBulkAction() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateBulkActionInput) => bulkActionsService.create(input),
    onSuccess: (action) => {
      sileo.info({ title: t('contacts.bulk.toasts.queued', { count: action.total }) })
      void client.invalidateQueries({ queryKey: QUERY_KEYS.bulkActions.all })
    },
    onError: (error: { message?: string }) => notifySaveFailed(error),
  })
}
