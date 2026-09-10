'use client'

import { useQuery } from '@tanstack/react-query'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

const CONTACT_STALE_MS = 30_000

export function useContact(contactId: string) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.contacts.detail(contactId),
    queryFn: () => contactsService.getById(contactId),
    staleTime: CONTACT_STALE_MS,
  })

  return {
    contact: data ?? null,
    isPending,
    isError,
    retry: () => void refetch(),
  }
}

export type ContactRecordQuery = ReturnType<typeof useContact>
