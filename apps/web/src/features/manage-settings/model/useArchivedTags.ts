'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import tagsService from '@/shared/api/services/tags.service'
import { COMPACT_PAGE_SIZE, FIRST_PAGE } from '@/shared/config/pagination'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { pageCount } from '@/shared/lib/pagination'
import { QUERY_KEYS } from '@/shared/query/query-keys'

const ENTITY = 'contact'

export function useArchivedTags() {
  const { t } = useTranslation()
  const client = useQueryClient()
  const [page, setPage] = useState(FIRST_PAGE)

  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.tags.trash(ENTITY, page),
    queryFn: () =>
      tagsService.list({ entityType: ENTITY, deleted: true, page, limit: COMPACT_PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })

  const restore = useMutation({
    mutationFn: (id: string) => tagsService.restore(id),
    onSuccess: () => {
      sileo.success({ title: t('settings.trash.tagRestored') })
      void client.invalidateQueries({ queryKey: QUERY_KEYS.tags.all })
      void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
    },
    onError: (error: { message?: string }) => notifySaveFailed(error),
  })

  const total = data?.total ?? 0
  const totalPages = pageCount(total, COMPACT_PAGE_SIZE)
  if (page > totalPages && totalPages >= FIRST_PAGE) setPage(totalPages)

  return {
    tags: data?.data ?? [],
    isPending,
    pagination: { page, totalPages, onPageChange: setPage },
    restore: restore.mutate,
    isRestoring: restore.isPending,
  }
}
