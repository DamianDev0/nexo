'use client'

import { useQuery } from '@tanstack/react-query'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactActivity, ContactTimeline } from '@repo/shared-types'

const EMPTY_ACTIVITIES: ReadonlyArray<ContactActivity> = []
const TIMELINE_STALE_MS = 30_000

function selectActivities(timeline: ContactTimeline): ContactActivity[] {
  return [...timeline.activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function useContactTimeline(contactId: string | null, enabled: boolean) {
  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.contacts.timeline(contactId ?? ''),
    queryFn: () => contactsService.timeline(contactId ?? ''),
    enabled: enabled && contactId !== null,
    staleTime: TIMELINE_STALE_MS,
    select: selectActivities,
  })

  return { activities: data ?? EMPTY_ACTIVITIES, isLoading: enabled && isPending }
}
