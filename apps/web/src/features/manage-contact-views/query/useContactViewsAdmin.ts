'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import contactsService from '@/shared/api/services/contacts.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactViewInput } from '@repo/shared-types'

export function useContactViewsAdmin() {
  const client = useQueryClient()

  const refresh = () => client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.workspace })
  const onError = (error: { message?: string }) => notifySaveFailed(error)

  const create = useMutation({
    mutationFn: (data: ContactViewInput) => contactsService.createView(data),
    onSuccess: async (view) => {
      await refresh()
      sileo.success({ title: t('contacts.views.saved', { name: view.name }) })
    },
    onError,
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContactViewInput> }) =>
      contactsService.updateView(id, data),
    onSuccess: async () => {
      await refresh()
      sileo.success({ title: t('contacts.views.updated') })
    },
    onError,
  })

  const duplicate = useMutation({
    mutationFn: (id: string) => contactsService.duplicateView(id),
    onSuccess: async (view) => {
      await refresh()
      sileo.success({ title: t('contacts.views.duplicated', { name: view.name }) })
    },
    onError,
  })

  const remove = useMutation({
    mutationFn: (id: string) => contactsService.deleteView(id),
    onSuccess: async () => {
      await refresh()
      sileo.success({ title: t('contacts.views.deleted') })
    },
    onError,
  })

  return {
    create: create.mutate,
    update: update.mutate,
    duplicate: duplicate.mutate,
    remove: remove.mutate,
    isPending: create.isPending || update.isPending || duplicate.isPending || remove.isPending,
  }
}
