'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useCallback } from 'react'
import { sileo } from 'sileo'

import { isActivityCompleted } from '@/entities/activity'
import activitiesService from '@/shared/api/services/activities.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactActivity } from '@repo/shared-types'

export function useToggleContactActivity() {
  const client = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: (activity: ContactActivity) =>
      isActivityCompleted(activity)
        ? activitiesService.reopen(activity.id)
        : activitiesService.complete(activity.id),
    onSuccess: (_data, activity) => {
      sileo.success({
        title: t(
          isActivityCompleted(activity)
            ? 'contacts.preview.tasks.reopened'
            : 'contacts.preview.tasks.completed',
        ),
      })
      void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
    },
    onError: () => sileo.error({ title: t('common.saveFailed') }),
  })

  return useCallback((activity: ContactActivity) => mutate(activity), [mutate])
}
