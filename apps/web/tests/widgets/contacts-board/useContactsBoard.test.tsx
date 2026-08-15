import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CONTACTS_FIXTURE, CONTACT_COLUMNS_FIXTURE } from '../../msw/handlers'
import { API, createMswServer } from '../../msw/test-server'
import { resetUrl } from '../../next-navigation-mock'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useContactsBoard } from '@/widgets/contacts-board/model/useContactsBoard'

vi.mock('next/navigation', () => import('../../next-navigation-mock'))

const server = createMswServer()

function boardHandlers() {
  return [
    http.get(`${API}/contacts`, () =>
      HttpResponse.json({
        statusCode: 200,
        message: 'OK',
        data: { data: CONTACTS_FIXTURE, total: 2, page: 1, limit: 25 },
        timestamp: new Date().toISOString(),
        path: '/contacts',
        method: 'GET',
      }),
    ),
    http.get(`${API}/contacts/counts`, () =>
      HttpResponse.json({ data: { total: 2, byStatus: { new: 1, qualified: 1 } } }),
    ),
    http.get(`${API}/settings/contact-taxonomy`, () =>
      HttpResponse.json({
        data: {
          statuses: [
            { key: 'new', label: 'Nuevo', color: '#3B82F6', order: 1, enabled: true },
            { key: 'qualified', label: 'Calificado', color: '#22C55E', order: 2, enabled: true },
          ],
          sources: [],
        },
      }),
    ),
  ]
}

function workspaceHandler(tableState: Record<string, unknown>) {
  return http.get(`${API}/contacts/workspace`, () =>
    HttpResponse.json({
      data: {
        views: [],
        activeViewId: null,
        tableState,
        columns: CONTACT_COLUMNS_FIXTURE,
        quickFilters: { statuses: [], sources: [], lifecycleStages: [] },
        counts: { total: 2, byStatus: {} },
      },
    }),
  )
}

beforeEach(() => {
  resetUrl()
})

describe('useContactsBoard', () => {
  it('builds smart lists with the pinned all list first and live counts', async () => {
    server.use(...boardHandlers())

    const { result } = renderHook(() => useContactsBoard(), { wrapper })

    await waitFor(() => expect(result.current.lists.items).toHaveLength(3))
    const [all, first] = result.current.lists.items
    expect(all).toMatchObject({ id: 'all', pinned: true, count: 2 })
    expect(first).toMatchObject({ id: 'new', label: 'Nuevo', count: 1 })
    expect(result.current.lists.activeId).toBe('all')
    expect(result.current.state.isEmpty).toBe(false)
    expect(result.current.instance.table.getRowModel().rows[0]?.id).toBe(CONTACTS_FIXTURE[0]?.id)
  })

  it('reports an empty board once loading settles without rows', async () => {
    server.use(...boardHandlers())
    server.use(
      http.get(`${API}/contacts`, () =>
        HttpResponse.json({
          statusCode: 200,
          message: 'OK',
          data: { data: [], total: 0, page: 1, limit: 25 },
          timestamp: new Date().toISOString(),
          path: '/contacts',
          method: 'GET',
        }),
      ),
    )

    const { result } = renderHook(() => useContactsBoard(), { wrapper })

    await waitFor(() => expect(result.current.state.isPending).toBe(false))
    expect(result.current.state.isEmpty).toBe(true)
  })

  it('keeps the all list pinned first even when the stored order buries it', async () => {
    server.use(...boardHandlers(), workspaceHandler({ listOrder: ['qualified', 'new', 'all'] }))

    const { result } = renderHook(() => useContactsBoard(), { wrapper })

    await waitFor(() =>
      expect(result.current.lists.items.map((item) => item.id)).toEqual([
        'all',
        'qualified',
        'new',
      ]),
    )
  })

  it('applies the stored list order and persists reorders to the workspace', async () => {
    const saved: unknown[] = []
    server.use(
      ...boardHandlers(),
      workspaceHandler({ listOrder: ['qualified', 'new'] }),
      http.patch(`${API}/contacts/workspace`, async ({ request }) => {
        saved.push(await request.json())
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const { result } = renderHook(() => useContactsBoard(), { wrapper })

    await waitFor(() =>
      expect(result.current.lists.items.map((item) => item.id)).toEqual([
        'all',
        'qualified',
        'new',
      ]),
    )

    act(() => result.current.actions.onReorderLists(['new', 'qualified']))
    await waitFor(() =>
      expect(result.current.lists.items.map((item) => item.id)).toEqual([
        'all',
        'new',
        'qualified',
      ]),
    )

    await waitFor(
      () => expect(saved).toEqual([{ tableState: { listOrder: ['new', 'qualified'] } }]),
      { timeout: 3000 },
    )
  })

  it('maps list selection to the status filter and back to all', async () => {
    server.use(...boardHandlers())

    const { result } = renderHook(() => useContactsBoard(), { wrapper })
    await waitFor(() => expect(result.current.state.isPending).toBe(false))

    act(() => result.current.actions.onSelectList('qualified'))
    await waitFor(() => expect(result.current.lists.activeId).toBe('qualified'))

    act(() => result.current.actions.onSelectList('all'))
    await waitFor(() => expect(result.current.lists.activeId).toBe('all'))
  })

  it('archives every selected row and clears the selection', async () => {
    const deletedIds: string[] = []
    server.use(...boardHandlers())
    server.use(
      http.delete(`${API}/contacts/:id`, ({ params }) => {
        deletedIds.push(String(params.id))
        return HttpResponse.json({ data: null })
      }),
    )

    const { result } = renderHook(() => useContactsBoard(), { wrapper })
    await waitFor(() => expect(result.current.state.isPending).toBe(false))

    act(() => {
      for (const row of result.current.instance.table.getRowModel().rows) row.toggleSelected(true)
    })
    await waitFor(() => expect(result.current.instance.selection.count).toBe(2))

    act(() => result.current.actions.onArchiveSelected())

    await waitFor(() => expect(deletedIds).toHaveLength(2))
    expect(deletedIds).toEqual(CONTACTS_FIXTURE.map((contact) => contact.id))
    await waitFor(() => expect(result.current.instance.selection.count).toBe(0))
  })

  it('ignores the archive action when nothing is selected', async () => {
    const deletedIds: string[] = []
    server.use(...boardHandlers())
    server.use(
      http.delete(`${API}/contacts/:id`, ({ params }) => {
        deletedIds.push(String(params.id))
        return HttpResponse.json({ data: null })
      }),
    )

    const { result } = renderHook(() => useContactsBoard(), { wrapper })
    await waitFor(() => expect(result.current.state.isPending).toBe(false))

    act(() => result.current.actions.onArchiveSelected())

    expect(deletedIds).toEqual([])
  })

  it('opens the create sheet without a contact and closes it again', async () => {
    server.use(...boardHandlers())

    const { result } = renderHook(() => useContactsBoard(), { wrapper })
    await waitFor(() => expect(result.current.state.isPending).toBe(false))
    expect(result.current.sheet.open).toBe(false)

    act(() => result.current.actions.onCreate())
    expect(result.current.sheet.open).toBe(true)
    expect(result.current.sheet.contact).toBeNull()

    act(() => result.current.sheet.onOpenChange(false))
    expect(result.current.sheet.open).toBe(false)
  })
})
