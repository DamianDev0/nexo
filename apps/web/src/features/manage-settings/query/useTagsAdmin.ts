'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import tagsService from '@/shared/api/services/tags.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { Tag } from '@repo/shared-types'

const ENTITY = 'contact'

export function useTagsAdmin() {
  const queryClient = useQueryClient()

  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.tags.byEntity(ENTITY),
    queryFn: () => tagsService.list(ENTITY),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags.all })
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
  }

  const onError = (error: { message?: string }) => {
    sileo.error({ title: t('common.saveFailed'), description: error.message })
  }

  const create = useMutation({
    mutationFn: (input: { name: string; color: string }) =>
      tagsService.create({ ...input, entityType: ENTITY }),
    onSuccess: () => {
      invalidate()
      sileo.success({ title: t('settings.tags.created') })
    },
    onError,
  })

  const update = useMutation({
    mutationFn: (input: { id: string; name?: string; color?: string }) =>
      tagsService.update(input.id, { name: input.name, color: input.color }),
    onSuccess: () => {
      invalidate()
      sileo.success({ title: t('settings.saved') })
    },
    onError,
  })

  const remove = useMutation({
    mutationFn: (tag: Tag) => tagsService.remove(tag.id),
    onSuccess: () => {
      invalidate()
      sileo.success({ title: t('settings.tags.deleted') })
    },
    onError,
  })

  return {
    tags: data ?? [],
    isPending,
    create: create.mutate,
    update: update.mutate,
    remove: remove.mutate,
  }
}
