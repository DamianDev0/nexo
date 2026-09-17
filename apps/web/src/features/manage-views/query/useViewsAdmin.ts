'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useMemo } from 'react'
import { sileo } from 'sileo'

import { useObjectDescriptor } from '@/entities/object-descriptor'
import { objectViewsService } from '@/shared/api/services/object-views.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ObjectViewInput } from '@repo/shared-types'

export function useViewsAdmin() {
  const { apiPath, queryRoot } = useObjectDescriptor()
  const client = useQueryClient()
  const service = useMemo(() => objectViewsService(apiPath), [apiPath])
  const workspaceKey = QUERY_KEYS.objects.workspace(queryRoot)

  const refresh = () => client.invalidateQueries({ queryKey: workspaceKey })
  const onError = (error: { message?: string }) => notifySaveFailed(error)

  const create = useMutation({
    mutationFn: (data: ObjectViewInput) => service.createView(data),
    onSuccess: async (view) => {
      await refresh()
      sileo.success({ title: t('views.saved', { name: view.name }) })
    },
    onError,
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ObjectViewInput> }) =>
      service.updateView(id, data),
    onSuccess: async () => {
      await refresh()
      sileo.success({ title: t('views.updated') })
    },
    onError,
  })

  const duplicate = useMutation({
    mutationFn: (id: string) => service.duplicateView(id),
    onSuccess: async (view) => {
      await refresh()
      sileo.success({ title: t('views.duplicated', { name: view.name }) })
    },
    onError,
  })

  const reorder = useMutation({
    mutationFn: (ids: ReadonlyArray<string>) => service.reorderViews(ids),
    scope: { id: `${queryRoot}-views-reorder` },
    onMutate: () => client.cancelQueries({ queryKey: workspaceKey }),
    onSuccess: refresh,
    onError,
  })

  const remove = useMutation({
    mutationFn: (id: string) => service.deleteView(id),
    onSuccess: async () => {
      await refresh()
      sileo.success({ title: t('views.deleted') })
    },
    onError,
  })

  return {
    create: create.mutate,
    update: update.mutate,
    duplicate: duplicate.mutate,
    reorder: reorder.mutate,
    remove: remove.mutate,
    isPending: create.isPending || update.isPending || duplicate.isPending || remove.isPending,
  }
}
