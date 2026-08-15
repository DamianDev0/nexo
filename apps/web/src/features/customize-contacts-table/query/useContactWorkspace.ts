'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { CONTACTS_TABLE_SAVE_DELAY_MS } from '../config/contacts-table.constants'

import type { ContactTableState, ContactWorkspace } from '@repo/shared-types'

export function useContactWorkspace() {
  return useQuery({
    queryKey: QUERY_KEYS.contacts.workspace,
    queryFn: contactsService.workspace,
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useSaveContactTableState() {
  const client = useQueryClient()
  const { mutate } = useMutation({ mutationFn: contactsService.saveTableState })
  const pending = useRef<ContactTableState | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const flush = useCallback(() => {
    clearTimeout(timer.current)
    const patch = pending.current
    pending.current = null
    if (patch) mutate(patch)
  }, [mutate])

  useEffect(() => flush, [flush])

  return useCallback(
    (patch: ContactTableState) => {
      client.setQueryData<ContactWorkspace>(QUERY_KEYS.contacts.workspace, (previous) =>
        previous ? { ...previous, tableState: { ...previous.tableState, ...patch } } : previous,
      )
      pending.current = { ...pending.current, ...patch }
      clearTimeout(timer.current)
      timer.current = setTimeout(flush, CONTACTS_TABLE_SAVE_DELAY_MS)
    },
    [client, flush],
  )
}
