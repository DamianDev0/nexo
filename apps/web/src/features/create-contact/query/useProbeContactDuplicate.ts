'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactDuplicatePayload, ContactDuplicateProbeQuery } from '@repo/shared-types'

const PROBE_STALE_MS = 30_000

export function useProbeContactDuplicate(): (
  params: ContactDuplicateProbeQuery,
) => Promise<ContactDuplicatePayload | null> {
  const queryClient = useQueryClient()

  return useCallback(
    async (params) => {
      try {
        const { duplicate } = await queryClient.fetchQuery({
          queryKey: QUERY_KEYS.contacts.duplicateProbe(params),
          queryFn: () => contactsService.probeDuplicates(params),
          staleTime: PROBE_STALE_MS,
          retry: false,
        })
        return duplicate
      } catch {
        return null
      }
    },
    [queryClient],
  )
}
