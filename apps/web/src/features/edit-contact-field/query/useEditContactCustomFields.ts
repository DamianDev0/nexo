'use client'

import { t } from 'i18next'
import { useCallback } from 'react'

import { useOptimisticContactListPatch } from '@/entities/contact'
import contactsService from '@/shared/api/services/contacts.service'

import { applyCustomFields } from '../lib/apply-custom-fields'

import type { CustomFieldsChange } from '../lib/apply-custom-fields'

export function useEditContactCustomFields() {
  const mutate = useOptimisticContactListPatch<CustomFieldsChange>({
    mutationFn: ({ id, customFields }) => contactsService.update(id, { customFields }),
    patch: applyCustomFields,
    match: (contact, change) => contact.id === change.id,
    successTitle: () => t('contacts.toasts.fieldUpdated'),
  })

  return useCallback(
    (id: string, customFields: Record<string, unknown>) => mutate({ id, customFields }),
    [mutate],
  )
}
