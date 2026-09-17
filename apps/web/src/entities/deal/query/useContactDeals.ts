'use client'

import { useLinkedDeals } from './useLinkedDeals'

export function useContactDeals(contactId: string) {
  return useLinkedDeals({ contactId })
}

export type ContactDealsFeed = ReturnType<typeof useContactDeals>
