import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ApiSuccessResponse, PaginatedContacts } from '@repo/shared-types'

import { useContactsTable } from '@/features/manage-contacts/model/useContactsTable'

function contactsResponse(
  overrides: Partial<PaginatedContacts> = {},
): ApiSuccessResponse<PaginatedContacts> {
  return {
    statusCode: 200,
    message: 'OK',
    data: {
      data: CONTACTS_FIXTURE,
      total: CONTACTS_FIXTURE.length,
      page: 1,
      limit: 25,
      ...overrides,
    },
    timestamp: new Date().toISOString(),
    path: '/contacts',
    method: 'GET',
  }
}

const server = createMswServer()

describe('useContactsTable', () => {
  it('returns rows and total from the mocked response', async () => {
    server.use(http.get(`${API}/contacts`, () => HttpResponse.json(contactsResponse())))

    const { result } = renderHook(() => useContactsTable(), { wrapper })

    await waitFor(() => expect(result.current.rows).toHaveLength(2))
    expect(result.current.total).toBe(2)
  })

  it('resets the page to 1 when handleSearch is called', async () => {
    server.use(http.get(`${API}/contacts`, () => HttpResponse.json(contactsResponse())))

    const { result } = renderHook(() => useContactsTable(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.setPage(3))
    expect(result.current.page).toBe(3)

    act(() => result.current.handleSearch('maria'))
    expect(result.current.page).toBe(1)
    expect(result.current.search).toBe('maria')
  })

  it('resets the page to 1 when handleStatus is called', async () => {
    server.use(http.get(`${API}/contacts`, () => HttpResponse.json(contactsResponse())))

    const { result } = renderHook(() => useContactsTable(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.setPage(2))
    expect(result.current.page).toBe(2)

    act(() => result.current.handleStatus('qualified'))
    expect(result.current.page).toBe(1)
    expect(result.current.status).toBe('qualified')
  })

  it('sends page and limit to the API and recomputes totalPages', async () => {
    const urls: URL[] = []
    server.use(
      http.get(`${API}/contacts`, ({ request }) => {
        urls.push(new URL(request.url))
        return HttpResponse.json(contactsResponse({ total: 60 }))
      }),
    )

    const { result } = renderHook(() => useContactsTable(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(urls.at(-1)?.searchParams.get('page')).toBe('1')
    expect(urls.at(-1)?.searchParams.get('limit')).toBe('25')
    expect(result.current.totalPages).toBe(3)

    act(() => result.current.setPage(2))
    act(() => result.current.handleLimit(50))

    await waitFor(() => expect(urls.at(-1)?.searchParams.get('limit')).toBe('50'))
    expect(result.current.page).toBe(1)
    expect(result.current.totalPages).toBe(2)
  })

  it('mirrors status and filters into the browser URL', async () => {
    server.use(http.get(`${API}/contacts`, () => HttpResponse.json(contactsResponse())))

    const { result } = renderHook(() => useContactsTable(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.isFiltered).toBe(false)

    act(() => result.current.handleStatus('qualified'))
    await waitFor(() => expect(globalThis.location.search).toBe('?list=qualified'))
    expect(result.current.isFiltered).toBe(true)

    act(() => result.current.handleToggleFilter('source', 'whatsapp'))
    await waitFor(() => expect(globalThis.location.search).toBe('?list=qualified&source=whatsapp'))

    act(() => result.current.handleClearFilters())
    act(() => result.current.handleStatus(null))
    await waitFor(() => expect(globalThis.location.search).toBe(''))
    expect(result.current.isFiltered).toBe(false)
  })

  it('debounces the search value before it reaches the query', async () => {
    const receivedQueries: Array<string | null> = []
    server.use(
      http.get(`${API}/contacts`, ({ request }) => {
        receivedQueries.push(new URL(request.url).searchParams.get('q'))
        return HttpResponse.json(contactsResponse())
      }),
    )

    const { result } = renderHook(() => useContactsTable(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.handleSearch('carlos'))
    expect(receivedQueries.every((q) => q !== 'carlos')).toBe(true)

    await waitFor(() => expect(receivedQueries).toContain('carlos'))
  })
})
