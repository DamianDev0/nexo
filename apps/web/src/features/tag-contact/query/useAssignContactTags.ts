'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

type TagsChange = { id: string; tags: readonly string[] }

export function useAssignContactTags() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: ({ id, tags }: TagsChange) => contactsService.update(id, { tags: [...tags] }),
    onSuccess: () => {
      sileo.success({ title: t('contacts.composers.tags.saved') })
      void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
    },
    onError: () => sileo.error({ title: t('common.saveFailed') }),
  })
}
