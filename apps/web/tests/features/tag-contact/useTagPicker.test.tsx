import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { Tag } from '@repo/shared-types'

import { useTagPicker } from '@/features/tag-contact/model/useTagPicker'

const server = createMswServer()

const TAG = (name: string, color: string): Tag => ({
  id: name,
  name,
  color,
  description: null,
  enabled: true,
  deletedAt: null,
  entityType: 'contact',
  createdAt: '2026-01-01T00:00:00.000Z',
})

vi.mock('@/entities/tag', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/tag')>()),
  useTagCatalog: () => {
    const map = new Map<string, Tag>()
    map.set('vip', { ...TAG('VIP', '#f00'), description: 'Cliente de alto valor' })
    map.set('lead frío', TAG('Lead frío', '#00f'))
    return map
  },
}))

const CONTACT = { id: 'c1', tags: ['VIP', 'Manual'] }

describe('useTagPicker', () => {
  it('merges catalog and ad-hoc contact tags, sorted', () => {
    const { result } = renderHook(() => useTagPicker(CONTACT, vi.fn()), { wrapper })
    expect(result.current.options.map((o) => o.name)).toEqual(['Lead frío', 'Manual', 'VIP'])
    expect(result.current.options.find((o) => o.name === 'VIP')?.selected).toBe(true)
    expect(result.current.options.find((o) => o.name === 'Manual')?.color).toBeNull()
  })

  it('carries the catalog description into each option', () => {
    const { result } = renderHook(() => useTagPicker(CONTACT, vi.fn()), { wrapper })
    expect(result.current.options.find((o) => o.name === 'VIP')?.description).toBe(
      'Cliente de alto valor',
    )
    expect(result.current.options.find((o) => o.name === 'Manual')?.description).toBeNull()
  })

  it('filters by query', () => {
    const { result } = renderHook(() => useTagPicker(CONTACT, vi.fn()), { wrapper })
    act(() => result.current.setQuery('vip'))
    expect(result.current.options.map((o) => o.name)).toEqual(['VIP'])
  })

  it('toggles selection and tracks dirtiness', () => {
    const { result } = renderHook(() => useTagPicker(CONTACT, vi.fn()), { wrapper })
    expect(result.current.isDirty).toBe(false)
    act(() => result.current.toggle('Lead frío'))
    expect(result.current.isDirty).toBe(true)
    expect(result.current.selectedCount).toBe(3)
    act(() => result.current.toggle('Lead frío'))
    expect(result.current.isDirty).toBe(false)
  })

  it('patches the contact with the selected tags and calls onDone', async () => {
    const patches: unknown[] = []
    server.use(
      http.patch(`${API}/contacts/c1`, async ({ request }) => {
        patches.push(await request.json())
        return HttpResponse.json({ data: { id: 'c1' } })
      }),
    )
    const onDone = vi.fn()
    const { result } = renderHook(() => useTagPicker(CONTACT, onDone), { wrapper })
    act(() => result.current.toggle('Manual'))
    act(() => result.current.save())
    await waitFor(() => expect(onDone).toHaveBeenCalledOnce())
    expect(patches).toEqual([{ tags: ['VIP'] }])
  })
})
