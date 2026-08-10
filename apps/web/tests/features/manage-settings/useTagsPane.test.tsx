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
  { id: 'tag-1', name: 'VIP', color: '#3B82F6', entityType: 'contact', createdAt: '2026-01-01' },
  { id: 'tag-2', name: 'Frio', color: '#8B5CF6', entityType: 'contact', createdAt: '2026-01-02' },
]

function tagsHandlers(tags: Tag[]) {
  return [http.get(`${API}/tags`, () => HttpResponse.json({ data: tags }))]
}

describe('useTagsPane', () => {
  it('exposes the tags loaded from the server', async () => {
    server.use(...tagsHandlers(TAGS))

    const { result } = renderHook(() => useTagsPane(), { wrapper })

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.tags).toEqual(TAGS)
    expect(result.current.newName).toBe('')
  })

  it('defaults to an empty tags array while loading', () => {
    server.use(...tagsHandlers(TAGS))

    const { result } = renderHook(() => useTagsPane(), { wrapper })

    expect(result.current.tags).toEqual([])
  })

  it('updates newName as the user types', async () => {
    server.use(...tagsHandlers(TAGS))
    const { result } = renderHook(() => useTagsPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.setNewName('Nuevo tag'))

    expect(result.current.newName).toBe('Nuevo tag')
  })

  it('handleAdd does nothing when the trimmed name is empty', async () => {
    server.use(...tagsHandlers(TAGS))
    let created = false
    server.use(
      http.post(`${API}/tags`, () => {
        created = true
        return HttpResponse.json({ data: TAGS[0] })
      }),
    )
    const { result } = renderHook(() => useTagsPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.setNewName('   '))
    act(() => result.current.handleAdd())

    expect(created).toBe(false)
    expect(result.current.newName).toBe('   ')
  })

  it('handleAdd creates a tag with the trimmed name, the next taxonomy color, and clears newName', async () => {
    server.use(...tagsHandlers(TAGS))
    let receivedBody: Record<string, unknown> | null = null
    server.use(
      http.post(`${API}/tags`, async ({ request }) => {
        receivedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          data: {
            id: 'tag-3',
            name: 'Caliente',
            color: '#06B6D4',
            entityType: 'contact',
            createdAt: '2026-01-03',
          },
        })
      }),
    )
    const { result } = renderHook(() => useTagsPane(), { wrapper })
    await waitFor(() => expect(result.current.tags).toEqual(TAGS))

    act(() => result.current.setNewName('  Caliente  '))
    act(() => result.current.handleAdd())

    await waitFor(() => expect(receivedBody).not.toBeNull())
    expect(receivedBody).toMatchObject({
      name: 'Caliente',
      entityType: 'contact',
      color: '#06B6D4',
    })
    expect(result.current.newName).toBe('')
  })

  it('exposes onUpdate wired to update and onRemove wired to remove', async () => {
    server.use(...tagsHandlers(TAGS))
    let patched: Record<string, unknown> | null = null
    let removedId: string | null = null
    server.use(
      http.patch(`${API}/tags/:id`, async ({ request }) => {
        patched = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: TAGS[0] })
      }),
      http.delete(`${API}/tags/:id`, ({ params }) => {
        removedId = params.id as string
        return HttpResponse.json({ data: null })
      }),
    )
    const { result } = renderHook(() => useTagsPane(), { wrapper })
    await waitFor(() => expect(result.current.tags).toEqual(TAGS))

    act(() => result.current.actions.onUpdate({ id: 'tag-1', name: 'VIP Gold' }))
    await waitFor(() => expect(patched).toEqual({ name: 'VIP Gold' }))

    act(() => result.current.actions.onRemove(TAGS[1]!))
    await waitFor(() => expect(removedId).toBe('tag-2'))
  })
})
