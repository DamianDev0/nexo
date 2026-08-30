'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import settingsService from '@/shared/api/services/settings.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ActivityTypeDef } from '@repo/shared-types'

export function useActivityTypesAdmin() {
  const queryClient = useQueryClient()

  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.settings.activityTypes,
    queryFn: () => settingsService.getActivityTypes(),
  })

  const applyList = (list: ActivityTypeDef[]) => {
    queryClient.setQueryData(QUERY_KEYS.settings.activityTypes, list)
  }

  const onError = (error: { message?: string }) => notifySaveFailed(error)

  const create = useMutation({
    mutationFn: (def: ActivityTypeDef) => settingsService.createActivityType(def),
    onSuccess: (list) => {
      applyList(list)
      sileo.success({ title: t('settings.activityTypes.created') })
    },
    onError,
  })

  const update = useMutation({
    mutationFn: (def: ActivityTypeDef) => settingsService.updateActivityType(def.key, def),
    onSuccess: (list) => {
      applyList(list)
      sileo.success({ title: t('settings.saved') })
    },
    onError,
  })

  const remove = useMutation({
    mutationFn: (key: string) => settingsService.deleteActivityType(key),
    onSuccess: (list) => {
      applyList(list)
      sileo.success({ title: t('settings.activityTypes.deleted') })
    },
    onError,
  })

  return {
    types: data ?? [],
    isPending,
    create: create.mutate,
    update: update.mutate,
    remove: remove.mutate,
  }
}
