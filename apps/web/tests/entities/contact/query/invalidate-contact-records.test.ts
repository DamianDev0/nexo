import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import { invalidateContactRecords } from '@/entities/contact'
import { QUERY_KEYS } from '@/shared/query/query-keys'

function spyOnInvalidate(client: QueryClient) {
  return vi.spyOn(client, 'invalidateQueries').mockResolvedValue(undefined)
}

describe('invalidateContactRecords', () => {
  it('refreshes list data without touching the workspace configuration', async () => {
    const client = new QueryClient()
    const invalidate = spyOnInvalidate(client)

    await invalidateContactRecords(client)

    const keys = invalidate.mock.calls.map(([options]) => options?.queryKey)
    expect(keys).toEqual([
      QUERY_KEYS.contacts.lists,
      QUERY_KEYS.contacts.counts,
      QUERY_KEYS.contacts.taxonomyUsage,
    ])
    expect(keys).not.toContain(QUERY_KEYS.contacts.workspace)
  })

  it('also refreshes the record itself when a contact is known', async () => {
    const client = new QueryClient()
    const invalidate = spyOnInvalidate(client)

    await invalidateContactRecords(client, 'c-1')

    const keys = invalidate.mock.calls.map(([options]) => options?.queryKey)
    expect(keys).toContainEqual(QUERY_KEYS.contacts.detail('c-1'))
    expect(keys).toContainEqual(QUERY_KEYS.contacts.timeline('c-1'))
  })
})
