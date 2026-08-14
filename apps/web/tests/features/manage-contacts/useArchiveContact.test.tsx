import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'

import type { ReactNode } from 'react'

import { useArchiveContact } from '@/features/manage-contacts/query/useArchiveContact'
import { QUERY_KEYS } from '@/shared/query/query-keys'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const sileoError = vi.fn()
const sileoSuccess = vi.fn()

vi.mock('sileo', () => ({
  sileo: {
    error: (...args: unknown[]) => sileoError(...args),
    success: (...args: unknown[]) => sileoSuccess(...args),
  },
}))

const server = createMswServer()

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return { client, Wrapper }
}

function archiveHandler(failing: ReadonlyArray<string> = []) {
  return http.delete(`${API}/contacts/:id`, ({ params }) => {
    if (failing.includes(params.id as string)) {
      return HttpResponse.json(
        {
          statusCode: 500,
          message: 'boom',
          error: 'Internal Server Error',
          timestamp: '',
          path: '/contacts',
          method: 'DELETE',
        },
        { status: 500 },
      )
    }
    return HttpResponse.json({ data: null })
  })
}

beforeEach(() => {
  sileoError.mockClear()
  sileoSuccess.mockClear()
})

describe('useArchiveContact', () => {
  it('reports success when every contact is archived', async () => {
    server.use(archiveHandler())
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useArchiveContact(), { wrapper: Wrapper })

    act(() => result.current.archive(['a', 'b']))

    await waitFor(() => expect(sileoSuccess).toHaveBeenCalledTimes(1))
    expect(sileoSuccess).toHaveBeenCalledWith({ title: 'contacts.toasts.archivedMany' })
    expect(sileoError).not.toHaveBeenCalled()
  })

  it('uses the singular toast for a single contact', async () => {
    server.use(archiveHandler())
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useArchiveContact(), { wrapper: Wrapper })

    act(() => result.current.archive(['a']))

    await waitFor(() =>
      expect(sileoSuccess).toHaveBeenCalledWith({ title: 'contacts.toasts.archived' }),
    )
  })

  it('reports the partial count when only some contacts archive', async () => {
    server.use(archiveHandler(['b']))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useArchiveContact(), { wrapper: Wrapper })

    act(() => result.current.archive(['a', 'b', 'c']))

    await waitFor(() => expect(sileoError).toHaveBeenCalledTimes(1))
    expect(sileoError).toHaveBeenCalledWith({ title: 'contacts.toasts.archivedPartial' })
    expect(sileoSuccess).not.toHaveBeenCalled()
  })

  it('refreshes the contact list even when part of the batch failed', async () => {
    server.use(archiveHandler(['b']))
    const { client, Wrapper } = makeWrapper()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const { result } = renderHook(() => useArchiveContact(), { wrapper: Wrapper })

    act(() => result.current.archive(['a', 'b']))

    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.contacts.all }),
    )
  })

  it('reports a plain failure when nothing could be archived', async () => {
    server.use(archiveHandler(['a', 'b']))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useArchiveContact(), { wrapper: Wrapper })

    act(() => result.current.archive(['a', 'b']))

    await waitFor(() => expect(sileoError).toHaveBeenCalledWith({ title: 'common.saveFailed' }))
    expect(sileoSuccess).not.toHaveBeenCalled()
  })
})
