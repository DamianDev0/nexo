import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useArchivedTags } from '@/features/manage-settings/model/useArchivedTags'

vi.mock('sileo', () => ({ sileo: { success: vi.fn(), error: vi.fn() } }))

const server = createMswServer()

function tag(id: string) {
  return {
    id,
    name: id,
    color: '#FBBF24',
    description: null,
    enabled: true,
    entityType: 'contact',
    deletedAt: '2026-09-05T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
  }
}

describe('useArchivedTags', () => {
  it('lists trashed contact tags and restores one', async () => {
    const restored: string[] = []
    server.use(
      http.get(`${API}/tags`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('deleted')).toBe('true')
        expect(url.searchParams.get('entityType')).toBe('contact')
        return HttpResponse.json({
          data: { data: [tag('vip'), tag('frio')], total: 2, page: 1, limit: 10 },
        })
      }),
      http.post(`${API}/tags/:id/restore`, ({ params }) => {
        restored.push(String(params.id))
        return HttpResponse.json({ data: { ...tag(String(params.id)), deletedAt: null } })
      }),
    )

    const { result } = renderHook(() => useArchivedTags(), { wrapper })

    await waitFor(() => expect(result.current.tags).toHaveLength(2))
    expect(result.current.pagination.totalPages).toBe(1)

    act(() => result.current.restore('vip'))
    await waitFor(() => expect(restored).toEqual(['vip']))
  })
})
