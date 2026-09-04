'use client'

import { useQuery } from '@tanstack/react-query'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactActivity, ContactTimeline } from '@repo/shared-types'

const EMPTY_NOTES: ReadonlyArray<ContactActivity> = []
const NOTES_STALE_MS = 30_000

function selectNotes(timeline: ContactTimeline): ContactActivity[] {
  return timeline.activities.filter((activity) => activity.activityType === 'note')
}

export function useContactNotes(contactId: string, enabled: boolean) {
  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.contacts.timeline(contactId),
    queryFn: () => contactsService.timeline(contactId),
    enabled,
    staleTime: NOTES_STALE_MS,
    select: selectNotes,
  })

  return { notes: data ?? EMPTY_NOTES, isLoading: enabled && isPending }
}
