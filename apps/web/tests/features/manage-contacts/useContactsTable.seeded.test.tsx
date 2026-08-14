import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { API, createMswServer } from '../../msw/test-server'
import { setUrl } from '../../next-navigation-mock'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useContactsTable } from '@/features/manage-contacts/model/useContactsTable'

vi.mock('next/navigation', () => import('../../next-navigation-mock'))

const server = createMswServer()

beforeEach(() => {
  setUrl('q=ana&list=qualified&source=whatsapp')
})

describe('useContactsTable seeded from the URL', () => {
  it('hydrates search, status and quick filters from searchParams', async () => {
    const urls: URL[] = []
    server.use(
      http.get(`${API}/contacts`, ({ request }) => {
        urls.push(new URL(request.url))
        return HttpResponse.json({
          statusCode: 200,
          message: 'OK',
          data: { data: CONTACTS_FIXTURE, total: 2, page: 1, limit: 25 },
          timestamp: new Date().toISOString(),
          path: '/contacts',
          method: 'GET',
        })
      }),
    )

    const { result } = renderHook(() => useContactsTable(), { wrapper })

    expect(result.current.search).toBe('ana')
    expect(result.current.status).toBe('qualified')
    expect(result.current.filters.source).toEqual(['whatsapp'])
    expect(result.current.isFiltered).toBe(true)

    await waitFor(() => expect(result.current.isPending).toBe(false))
    const last = urls.at(-1)?.searchParams
    expect(last?.get('status')).toBe('qualified')
    expect(last?.get('q')).toBe('ana')
    expect(last?.get('source')).toBe('whatsapp')
  })
})
