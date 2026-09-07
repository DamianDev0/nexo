'use client'

import { t } from 'i18next'

import { useOptimisticContactListPatch } from '@/entities/contact'
import contactsService from '@/shared/api/services/contacts.service'

import { applyOwner } from '../lib/apply-owner'

import type { ContactOwnerChange } from '@/entities/contact'

export function useAssignContactOwner() {
  return useOptimisticContactListPatch<ContactOwnerChange>({
    mutationFn: ({ id, assignedToId }) => contactsService.update(id, { assignedToId }),
    patch: applyOwner,
    match: (contact, change) => contact.id === change.id,
    successTitle: () => t('contacts.toasts.ownerUpdated'),
  })
}
