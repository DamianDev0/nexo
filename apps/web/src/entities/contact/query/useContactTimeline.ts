'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactActivity, ContactTimeline } from '@repo/shared-types'

const EMPTY_ACTIVITIES: ReadonlyArray<ContactActivity> = []
const TIMELINE_STALE_MS = 30_000
export const TIMELINE_PAGE_SIZE = 50

function selectActivities(timeline: ContactTimeline): ContactActivity[] {
  return [...timeline.activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function useContactTimeline(contactId: string | null, enabled: boolean) {
  const [limit, setLimit] = useState(TIMELINE_PAGE_SIZE)
  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.contacts.timeline(contactId ?? '', limit),
    queryFn: () => contactsService.timeline(contactId ?? '', limit),
    enabled: enabled && contactId !== null,
    staleTime: TIMELINE_STALE_MS,
    select: selectActivities,
    placeholderData: keepPreviousData,
  })
  const activities = data ?? EMPTY_ACTIVITIES

  const loadMore = useCallback(() => setLimit((current) => current + TIMELINE_PAGE_SIZE), [])

  return {
    activities,
    isLoading: enabled && isPending,
    isError,
    isFetchingMore: isFetching && !isPending,
    hasMore: activities.length >= limit,
    loadMore,
    retry: () => void refetch(),
  }
}

export type ContactTimelineFeed = ReturnType<typeof useContactTimeline>
