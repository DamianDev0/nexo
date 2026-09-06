import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useArchivedContacts } from '@/features/manage-settings/model/useArchivedContacts'

vi.mock('sileo', () => ({ sileo: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

const server = createMswServer()

describe('useArchivedContacts', () => {
  it('lists archived contacts in compact pages and restores one or all', async () => {
    const restored: string[] = []
    let bulk: Record<string, unknown> | null = null
    server.use(
      http.get(`${API}/contacts`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('archived')).toBe('true')
        expect(url.searchParams.get('limit')).toBe('10')
        return HttpResponse.json({
          data: {
            data: CONTACTS_FIXTURE.map((contact) => ({ ...contact, isActive: false })),
            total: 12,
            page: 1,
            limit: 10,
          },
        })
      }),
      http.post(`${API}/contacts/:id/restore`, ({ params }) => {
        restored.push(String(params.id))
        return HttpResponse.json({ data: CONTACTS_FIXTURE[0] })
      }),
      http.post(`${API}/bulk-actions`, async ({ request }) => {
        bulk = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: { id: 'ba-1', total: 12 } })
      }),
      http.get(`${API}/settings/nomenclature`, () => HttpResponse.json({ data: {} })),
    )

    const { result } = renderHook(() => useArchivedContacts(), { wrapper })

    await waitFor(() => expect(result.current.contacts).toHaveLength(2))
    expect(result.current.pagination.totalPages).toBe(2)

    act(() => result.current.restoreOne(result.current.contacts[0]!))
    await waitFor(() => expect(restored).toEqual(['contact-1']))

    act(() => result.current.restoreAll())
    await waitFor(() => expect(bulk).not.toBeNull())
    expect(bulk).toMatchObject({
      action: 'restore',
      selection: { mode: 'filter', query: { archived: true } },
    })
  })
})
