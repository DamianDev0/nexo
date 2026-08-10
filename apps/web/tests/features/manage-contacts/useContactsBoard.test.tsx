import { flexRender } from '@tanstack/react-table'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useContactsBoard } from '@/features/manage-contacts/model/useContactsBoard'

function BoardActionsCell({ contactId }: Readonly<{ contactId: string }>) {
  const board = useContactsBoard()
  const row = board.instance.table.getRowModel().rows.find((r) => r.id === contactId)
  const cell = row?.getVisibleCells().find((c) => c.column.id === 'actions')

  return (
    <>
      {cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null}
      <output data-testid="sheet-state">
        {JSON.stringify({ open: board.sheet.open, contactId: board.sheet.contact?.id ?? null })}
      </output>
    </>
  )
}

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
            { key: 'new', label: 'Nuevo', color: '#3B82F6' },
            { key: 'qualified', label: 'Calificado', color: '#22C55E' },
          ],
          sources: [],
        },
      }),
    ),
  ]
}

const store = new Map<string, string>()

beforeEach(() => {
  store.clear()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    },
  })
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
    store.set('contacts.list-order', JSON.stringify(['qualified', 'new', 'all']))
    server.use(...boardHandlers())

    const { result } = renderHook(() => useContactsBoard(), { wrapper })

    await waitFor(() =>
      expect(result.current.lists.items.map((item) => item.id)).toEqual([
        'all',
        'qualified',
        'new',
      ]),
    )
  })

  it('applies a stored list order and persists reorders', async () => {
    store.set('contacts.list-order', JSON.stringify(['qualified', 'new']))
    server.use(...boardHandlers())

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
    expect(JSON.parse(store.get('contacts.list-order') ?? '[]')).toEqual(['new', 'qualified'])
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

  it('archives every selected row and resets the selection', async () => {
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
      for (const row of result.current.instance.table.getRowModel().rows) {
        row.toggleSelected(true)
      }
    })
    await waitFor(() => expect(result.current.state.selectedCount).toBe(2))

    act(() => result.current.actions.onArchiveSelected())

    await waitFor(() => expect(deletedIds).toHaveLength(2))
    expect(deletedIds).toEqual(CONTACTS_FIXTURE.map((contact) => contact.id))
    await waitFor(() => expect(result.current.state.selectedCount).toBe(0))
  })

  it('opens the edit sheet for the exact contact whose row action was clicked', async () => {
    server.use(...boardHandlers())
    const user = userEvent.setup()
    const target = CONTACTS_FIXTURE[1]!

    render(<BoardActionsCell contactId={target.id} />, { wrapper })

    await screen.findByRole('button', { name: 'contacts.actions.open' })
    await user.click(screen.getByRole('button', { name: 'contacts.actions.open' }))
    await user.click(await screen.findByText('contacts.actions.edit'))

    await waitFor(() =>
      expect(screen.getByTestId('sheet-state')).toHaveTextContent(
        JSON.stringify({ open: true, contactId: target.id }),
      ),
    )
  })

  it('archives only the exact contact whose row action was clicked', async () => {
    server.use(...boardHandlers())
    const deletedIds: string[] = []
    server.use(
      http.delete(`${API}/contacts/:id`, ({ params }) => {
        deletedIds.push(String(params.id))
        return HttpResponse.json({ data: null })
      }),
    )
    const user = userEvent.setup()
    const target = CONTACTS_FIXTURE[0]!

    render(<BoardActionsCell contactId={target.id} />, { wrapper })

    await screen.findByRole('button', { name: 'contacts.actions.open' })
    await user.click(screen.getByRole('button', { name: 'contacts.actions.open' }))
    await user.click(await screen.findByText('contacts.actions.archive'))

    await waitFor(() => expect(deletedIds).toEqual([target.id]))
  })
})
