'use client'

import { useQuery } from '@tanstack/react-query'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactConsent } from '@repo/shared-types'

const EMPTY: ReadonlyArray<ContactConsent> = []

export function useContactConsents(contactId: string, enabled = true) {
  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.contacts.consents(contactId),
    queryFn: () => contactsService.consents(contactId),
    enabled,
  })

  return { consents: data ?? EMPTY, isPending: enabled && isPending }
}
