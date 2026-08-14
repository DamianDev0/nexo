import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { Tag } from '@repo/shared-types'

import { useTagsPane } from '@/features/manage-settings/model/useTagsPane'

vi.mock('i18next', () => ({ t: (key: string) => key }))

vi.mock('sileo', () => ({ sileo: { error: vi.fn(), success: vi.fn() } }))

const server = createMswServer()

const TAGS: Tag[] = [
  {
    id: 'tag-1',
    name: 'VIP',
    color: '#60A5FA',
    description: null,
    enabled: true,
    entityType: 'contact',
    createdAt: '2026-01-01',
  },
  {
    id: 'tag-2',
    name: 'Frio',
    color: '#A78BFA',
    description: null,
    enabled: true,
    entityType: 'contact',
    createdAt: '2026-01-02',
  },
]

const EMPTY_USAGE = { statuses: {}, sources: {}, types: {}, tags: {} }

function baseHandlers(tags: Tag[], usageTags: Record<string, number> = {}) {
  return [
    http.get(`${API}/tags`, () =>
      HttpResponse.json({ data: { data: tags, total: tags.length, page: 1, limit: 10 } }),
    ),
    http.get(`${API}/contacts/taxonomy-usage`, () =>
      HttpResponse.json({ data: { ...EMPTY_USAGE, tags: usageTags } }),
    ),
  ]
}

describe('useTagsPane', () => {
  it('exposes the tags loaded from the server', async () => {
    server.use(...baseHandlers(TAGS))

    const { result } = renderHook(() => useTagsPane(), { wrapper })

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.tags).toEqual(TAGS)
  })

  it('defaults to an empty tags array while loading', () => {
    server.use(...baseHandlers(TAGS))

    const { result } = renderHook(() => useTagsPane(), { wrapper })

    expect(result.current.tags).toEqual([])
  })

  it('creates a tag from the editor with trimmed name, description and next palette color', async () => {
    server.use(...baseHandlers(TAGS))
    let receivedBody: Record<string, unknown> | null = null
    server.use(
      http.post(`${API}/tags`, async ({ request }) => {
        receivedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: { ...TAGS[0], id: 'tag-3', name: 'Caliente' } })
      }),
    )
    const { result } = renderHook(() => useTagsPane(), { wrapper })
    await waitFor(() => expect(result.current.tags).toEqual(TAGS))

    act(() => result.current.editor.openCreate())
    act(() =>
      result.current.editor.onSubmit({ name: 'Caliente', description: 'Listo para comprar' }),
    )

    await waitFor(() => expect(receivedBody).not.toBeNull())
    expect(receivedBody).toMatchObject({
      name: 'Caliente',
      description: 'Listo para comprar',
      entityType: 'contact',
      color: '#FB923C',
    })
  })

  it('edits a tag from the editor sending name and description', async () => {
    server.use(...baseHandlers(TAGS))
    let patched: Record<string, unknown> | null = null
    server.use(
      http.patch(`${API}/tags/:id`, async ({ request }) => {
        patched = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: TAGS[0] })
      }),
    )
    const { result } = renderHook(() => useTagsPane(), { wrapper })
    await waitFor(() => expect(result.current.tags).toEqual(TAGS))

    act(() => result.current.actions.onEdit(TAGS[0]!))
    expect(result.current.editor.editing).toEqual({ name: 'VIP', description: '' })

    act(() => result.current.editor.onSubmit({ name: 'VIP Gold', description: 'Top' }))

    await waitFor(() => expect(patched).toEqual({ name: 'VIP Gold', description: 'Top' }))
  })

  it('removes directly when no contacts use the tag', async () => {
    server.use(...baseHandlers(TAGS))
    let removedId: string | null = null
    server.use(
      http.delete(`${API}/tags/:id`, ({ params }) => {
        removedId = params.id as string
        return HttpResponse.json({ data: null })
      }),
    )
    const { result } = renderHook(() => useTagsPane(), { wrapper })
    await waitFor(() => expect(result.current.tags).toEqual(TAGS))

    act(() => result.current.actions.onRemove(TAGS[1]!))

    await waitFor(() => expect(removedId).toBe('tag-2'))
    expect(result.current.removal).toBeNull()
  })

  it('requires reassignment when contacts use the tag, then reassigns and deletes', async () => {
    server.use(...baseHandlers(TAGS, { Frio: 4 }))
    let reassignBody: Record<string, unknown> | null = null
    let removedId: string | null = null
    server.use(
      http.patch(`${API}/contacts/reassign-taxonomy`, async ({ request }) => {
        reassignBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: { reassigned: 4 } })
      }),
      http.delete(`${API}/tags/:id`, ({ params }) => {
        removedId = params.id as string
        return HttpResponse.json({ data: null })
      }),
    )
    const { result } = renderHook(() => useTagsPane(), { wrapper })
    await waitFor(() => expect(result.current.tags).toEqual(TAGS))
    await waitFor(() => expect(result.current.counts).toEqual({ Frio: 4 }))

    act(() => result.current.actions.onRemove(TAGS[1]!))
    expect(result.current.removal?.source).toEqual({ label: 'Frio', count: 4 })
    expect(result.current.removal?.candidates).toEqual([
      { key: 'VIP', label: 'VIP', color: '#60A5FA' },
    ])
    expect(removedId).toBeNull()

    act(() => result.current.removal?.confirm('VIP'))

    await waitFor(() =>
      expect(reassignBody).toEqual({ kind: 'tag', fromKey: 'Frio', toKey: 'VIP' }),
    )
    await waitFor(() => expect(removedId).toBe('tag-2'))
  })

  it('exposes pagination derived from the server total', async () => {
    const many = Array.from({ length: 23 }, (_, i) => ({
      ...TAGS[0]!,
      id: `tag-${i}`,
      name: `Tag ${i}`,
    }))
    server.use(
      ...baseHandlers(many),
      http.get(`${API}/tags`, () =>
        HttpResponse.json({ data: { data: many.slice(0, 10), total: 23, page: 1, limit: 10 } }),
      ),
    )
    const { result } = renderHook(() => useTagsPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(result.current.pagination.page).toBe(1)
    expect(result.current.pagination.totalPages).toBe(3)

    act(() => result.current.pagination.onPageChange(2))
    expect(result.current.pagination.page).toBe(2)
  })
})
