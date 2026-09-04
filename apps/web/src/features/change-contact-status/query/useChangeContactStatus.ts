'use client'

import { t } from 'i18next'
import { useCallback } from 'react'

import { useOptimisticContactListPatch } from '@/entities/contact'
import contactsService from '@/shared/api/services/contacts.service'

import { applyStatus } from '../lib/apply-status'

import type { StatusChange } from '../lib/apply-status'

export function useChangeContactStatus() {
  const mutate = useOptimisticContactListPatch<StatusChange>({
    mutationFn: ({ id, status }) => contactsService.update(id, { status }),
    patch: applyStatus,
    match: (contact, change) => contact.id === change.id,
    successTitle: () => t('contacts.toasts.statusUpdated'),
  })

  return useCallback((id: string, status: string) => mutate({ id, status }), [mutate])
}
