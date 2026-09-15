'use client'

import { t } from 'i18next'

import { useOptimisticContactListPatch } from '@/entities/contact'
import contactsService from '@/shared/api/services/contacts.service'

type TagsChange = { id: string; tags: readonly string[] }

export function useAssignContactTags() {
  return useOptimisticContactListPatch<TagsChange>({
    mutationFn: ({ id, tags }) => contactsService.update(id, { tags: [...tags] }),
    patch: (contact, { tags }) => ({ ...contact, tags: [...tags] }),
    match: (contact, { id }) => contact.id === id,
    successTitle: () => t('contacts.composers.tags.saved'),
  })
}
