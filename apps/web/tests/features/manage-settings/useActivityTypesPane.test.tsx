import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ActivityTypeDef } from '@repo/shared-types'

import { useActivityTypesPane } from '@/features/manage-settings/model/useActivityTypesPane'

vi.mock('i18next', () => ({ t: (key: string) => key }))

vi.mock('sileo', () => ({ sileo: { error: vi.fn(), success: vi.fn() } }))

const server = createMswServer()

const TYPES: ActivityTypeDef[] = [
  {
    key: 'call',
    label: 'Llamada',
    icon: 'phone',
    color: '#22C55E',
    trackDuration: true,
    isSystem: true,
  },
  {
    key: 'visita',
    label: 'Visita',
    icon: 'map-pin',
    color: '#60A5FA',
    trackDuration: false,
    isSystem: false,
  },
]

function listHandler(data: ActivityTypeDef[]) {
  return http.get(`${API}/settings/activity-types`, () => HttpResponse.json({ data }))
}

describe('useActivityTypesPane', () => {
  it('exposes the fetched activity types', async () => {
    server.use(listHandler(TYPES))

    const { result } = renderHook(() => useActivityTypesPane(), { wrapper })

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.types.map((type) => type.key)).toEqual(['call', 'visita'])
  })

  it('sends the full definition on patch, preserving key and isSystem', async () => {
    let sent: ActivityTypeDef | null = null
    server.use(
      listHandler(TYPES),
      http.put(`${API}/settings/activity-types/call`, async ({ request }) => {
        sent = (await request.json()) as ActivityTypeDef
        return HttpResponse.json({ data: TYPES })
      }),
    )

    const { result } = renderHook(() => useActivityTypesPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.actions.onPatch('call', { color: '#F87171' }))

    await waitFor(() => expect(sent).not.toBeNull())
    expect(sent!.key).toBe('call')
    expect(sent!.color).toBe('#F87171')
    expect(sent!.isSystem).toBe(true)
    expect(sent!.trackDuration).toBe(true)
  })

  it('ignores patches that blank the label', async () => {
    const put = vi.fn()
    server.use(
      listHandler(TYPES),
      http.put(`${API}/settings/activity-types/call`, () => {
        put()
        return HttpResponse.json({ data: TYPES })
      }),
    )

    const { result } = renderHook(() => useActivityTypesPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.actions.onPatch('call', { label: '   ' }))

    expect(put).not.toHaveBeenCalled()
  })

  it('creates a custom type from the form values and closes the dialog', async () => {
    let created: ActivityTypeDef | null = null
    server.use(
      listHandler(TYPES),
      http.post(`${API}/settings/activity-types`, async ({ request }) => {
        created = (await request.json()) as ActivityTypeDef
        return HttpResponse.json({ data: [...TYPES, created] })
      }),
    )

    const { result } = renderHook(() => useActivityTypesPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.creator.openCreate())
    expect(result.current.creator.open).toBe(true)

    act(() =>
      result.current.creator.onSubmit({
        label: 'Demo técnica',
        icon: 'users',
        color: '#A78BFA',
        trackDuration: true,
      }),
    )

    await waitFor(() => expect(created).not.toBeNull())
    expect(created!.key).toBe('demo_tecnica')
    expect(created!.isSystem).toBe(false)
    expect(result.current.creator.open).toBe(false)
  })

  it('deletes custom types but never system types', async () => {
    const deleted: string[] = []
    server.use(
      listHandler(TYPES),
      http.delete(`${API}/settings/activity-types/:key`, ({ params }) => {
        deleted.push(String(params.key))
        return HttpResponse.json({ data: TYPES.filter((type) => type.key !== params.key) })
      }),
    )

    const { result } = renderHook(() => useActivityTypesPane(), { wrapper })
    await waitFor(() => expect(result.current.isPending).toBe(false))

    act(() => result.current.actions.onRemove('call'))
    act(() => result.current.actions.onRemove('visita'))

    await waitFor(() => expect(deleted).toEqual(['visita']))
  })
})
