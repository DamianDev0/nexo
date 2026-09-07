'use client'

import { t } from 'i18next'
import { useCallback } from 'react'

import { useOptimisticContactListPatch } from '@/entities/contact'
import contactsService from '@/shared/api/services/contacts.service'

import { applyFields } from '../lib/apply-fields'

import type { FieldsChange } from '../lib/apply-fields'
import type { ContactFieldsPatch } from '@/entities/contact'

export function useEditContactFields() {
  const mutate = useOptimisticContactListPatch<FieldsChange>({
    mutationFn: ({ id, patch }) => contactsService.update(id, patch),
    patch: applyFields,
    match: (contact, change) => contact.id === change.id,
    successTitle: () => t('contacts.toasts.fieldUpdated'),
  })

  return useCallback((id: string, patch: ContactFieldsPatch) => mutate({ id, patch }), [mutate])
}
