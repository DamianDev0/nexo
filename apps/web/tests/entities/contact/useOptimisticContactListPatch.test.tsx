import { DocumentType, LifecycleStage } from '@repo/shared-types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ContactListItem, PaginatedContacts } from '@repo/shared-types'
import type { ReactNode } from 'react'

import { useOptimisticContactListPatch } from '@/entities/contact'
import { QUERY_KEYS } from '@/shared/query/query-keys'

vi.mock('i18next', () => ({ t: (key: string) => key }))

const sileoError = vi.fn()
const sileoSuccess = vi.fn()

vi.mock('sileo', () => ({
  sileo: {
    error: (...args: unknown[]) => sileoError(...args),
    success: (...args: unknown[]) => sileoSuccess(...args),
  },
}))

function makeContact(id: string, firstName: string): ContactListItem {
  return {
    id,
    firstName,
    lastName: null,
    email: null,
    phone: null,
    whatsapp: null,
    documentType: DocumentType.CC,
    documentNumber: null,
    city: null,
    municipioCode: null,
    status: 'new',
    statusChangedAt: null,
    avatarUrl: null,
    lifecycleStage: LifecycleStage.LEAD,
    source: null,
    lastContactedAt: null,
    tags: [],
    companyId: null,
    assignedToId: null,
    isActive: true,
    createdById: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    noteCount: 0,
    optedOutChannels: [],
  }
}

type NameChange = { id: string; firstName: string }

const listKey = QUERY_KEYS.contacts.list({ page: 1 })

function seedClient(): QueryClient {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const page: PaginatedContacts = {
    data: [makeContact('c1', 'Ana'), makeContact('c2', 'Luis')],
    total: 2,
    page: 1,
    limit: 25,
  }
  client.setQueryData(listKey, page)
  return client
}

function renderPatchHook(mutationFn: (change: NameChange) => Promise<unknown>) {
  const client = seedClient()
  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  const { result } = renderHook(
    () =>
      useOptimisticContactListPatch<NameChange>({
        mutationFn,
        patch: (contact, change) => ({ ...contact, firstName: change.firstName }),
        match: (contact, change) => contact.id === change.id,
        successTitle: () => 'contacts.toasts.statusUpdated',
      }),
    { wrapper: Wrapper },
  )
  return { client, result }
}

function names(client: QueryClient): string[] {
  const page = client.getQueryData<PaginatedContacts>(listKey)
  return page?.data.map((contact) => contact.firstName) ?? []
}

beforeEach(() => {
  sileoError.mockClear()
  sileoSuccess.mockClear()
})

describe('useOptimisticContactListPatch', () => {
  it('patches only the matching contact optimistically and reports success', async () => {
    const { client, result } = renderPatchHook(() => Promise.resolve(null))

    act(() => result.current({ id: 'c1', firstName: 'Zoe' }))

    await waitFor(() => expect(names(client)).toEqual(['Zoe', 'Luis']))
    await waitFor(() => expect(sileoSuccess).toHaveBeenCalledTimes(1))
    expect(sileoSuccess).toHaveBeenCalledWith({ title: 'contacts.toasts.statusUpdated' })
    expect(sileoError).not.toHaveBeenCalled()
  })

  it('rolls back the optimistic patch when the mutation fails', async () => {
    let reject: (error: Error) => void = () => undefined
    const { client, result } = renderPatchHook(
      () =>
        new Promise((_resolve, rejectPromise) => {
          reject = rejectPromise
        }),
    )

    act(() => result.current({ id: 'c1', firstName: 'Zoe' }))

    await waitFor(() => expect(names(client)).toEqual(['Zoe', 'Luis']))

    act(() => reject(new Error('boom')))

    await waitFor(() => expect(names(client)).toEqual(['Ana', 'Luis']))
    expect(sileoError).toHaveBeenCalledWith({ title: 'common.saveFailed' })
    expect(sileoSuccess).not.toHaveBeenCalled()
  })

  it('invalidates the contacts scope after settling', async () => {
    const { client, result } = renderPatchHook(() => Promise.resolve(null))
    const invalidate = vi.spyOn(client, 'invalidateQueries')

    act(() => result.current({ id: 'c2', firstName: 'Lucía' }))

    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.contacts.all }),
    )
  })
})
