'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import tagsService from '@/shared/api/services/tags.service'
import { COMPACT_PAGE_SIZE } from '@/shared/config/pagination'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { TagPatch } from '../model/types'
import type { Tag } from '@repo/shared-types'

const ENTITY = 'contact'

export function useTagsAdmin(page: number) {
  const queryClient = useQueryClient()

  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.tags.page(ENTITY, page),
    queryFn: () => tagsService.list({ entityType: ENTITY, page, limit: COMPACT_PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags.all })
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
  }

  const onError = (error: { message?: string }) => notifySaveFailed(error)

  const create = useMutation({
    mutationFn: (input: { name: string; color: string; description?: string }) =>
      tagsService.create({ ...input, entityType: ENTITY }),
    onSuccess: () => {
      invalidate()
      sileo.success({ title: t('settings.tags.created') })
    },
    onError,
  })

  const update = useMutation({
    mutationFn: (input: TagPatch) =>
      tagsService.update(input.id, {
        name: input.name,
        color: input.color,
        description: input.description,
        enabled: input.enabled,
      }),
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
    tags: data?.data ?? [],
    total: data?.total ?? 0,
    isPending,
    create: create.mutate,
    update: update.mutate,
    remove: remove.mutate,
  }
}
