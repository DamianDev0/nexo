import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useBulkActions } from '@/features/bulk-actions/model/useBulkActions'

const sileoSuccess = vi.fn()
const sileoError = vi.fn()
const sileoInfo = vi.fn()

vi.mock('sileo', () => ({
  sileo: {
    success: (...args: unknown[]) => sileoSuccess(...args),
    error: (...args: unknown[]) => sileoError(...args),
    info: (...args: unknown[]) => sileoInfo(...args),
  },
}))

const server = createMswServer()

function action(overrides: Record<string, unknown>) {
  return {
    id: 'ba-1',
    entity: 'contacts',
    action: 'add_tags',
    params: {},
    status: 'queued',
    total: 2,
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [],
    resultFileUrl: null,
    revertedAt: null,
    revertsId: null,
    createdById: 'u1',
    createdByName: 'Ana',
    startedAt: null,
    finishedAt: null,
    createdAt: '2026-09-05T00:00:00.000Z',
    ...overrides,
  }
}

function setup(ids: string[] = ['a', 'b'], total = 40) {
  const clearSelection = vi.fn()
  const hook = renderHook(
    () =>
      useBulkActions({
        selectedIds: () => ids,
        selectedCount: ids.length,
        clearSelection,
        query: { status: 'new', page: 2, limit: 25 },
        total,
      }),
    { wrapper },
  )
  return { ...hook, clearSelection }
}

beforeEach(() => {
  sileoSuccess.mockClear()
  sileoError.mockClear()
  sileoInfo.mockClear()
})

describe('useBulkActions', () => {
  it('posts the selected ids, clears the selection and closes the dialog', async () => {
    let received: Record<string, unknown> | null = null
    server.use(
      http.post(`${API}/bulk-actions`, async ({ request }) => {
        received = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: action({}) })
      }),
      http.get(`${API}/bulk-actions/ba-1`, () =>
        HttpResponse.json({ data: action({ status: 'running', processed: 1 }) }),
      ),
    )
    const { result, clearSelection } = setup()

    act(() => result.current.bar.onOpen('add_tags'))
    expect(result.current.dialogs.open).toBe('add_tags')
    expect(result.current.dialogs.count).toBe(2)

    act(() => result.current.dialogs.addTags(['vip']))

    await waitFor(() => expect(received).not.toBeNull())
    expect(received).toEqual({
      entity: 'contacts',
      action: 'add_tags',
      params: { tags: ['vip'] },
      selection: { mode: 'ids', ids: ['a', 'b'] },
    })
    await waitFor(() => expect(result.current.dialogs.open).toBeNull())
    expect(clearSelection).toHaveBeenCalled()
    expect(sileoInfo).toHaveBeenCalled()
    await waitFor(() => expect(result.current.bar.progress?.processed).toBe(1))
    expect(result.current.bar.isBusy).toBe(true)
  })

  it('targets the whole filter after select-all, without paging', async () => {
    let received: Record<string, unknown> | null = null
    server.use(
      http.post(`${API}/bulk-actions`, async ({ request }) => {
        received = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: action({ status: 'completed', total: 40 }) })
      }),
      http.get(`${API}/bulk-actions/ba-1`, () =>
        HttpResponse.json({ data: action({ status: 'completed', total: 40, succeeded: 40 }) }),
      ),
    )
    const { result } = setup()

    act(() => result.current.bar.banner.onSelectAll())
    expect(result.current.bar.banner.allSelected).toBe(true)
    expect(result.current.dialogs.count).toBe(40)

    act(() => result.current.bar.onExport())

    await waitFor(() => expect(received).not.toBeNull())
    expect(received).toMatchObject({
      action: 'export',
      selection: { mode: 'filter', query: { status: 'new' } },
    })
    await waitFor(() => expect(sileoSuccess).toHaveBeenCalled())
    expect(result.current.bar.isBusy).toBe(false)
  })

  it('switches the bar to restore mode on the archived list and posts a restore', async () => {
    let received: Record<string, unknown> | null = null
    server.use(
      http.post(`${API}/bulk-actions`, async ({ request }) => {
        received = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: action({ action: 'restore', status: 'completed' }) })
      }),
      http.get(`${API}/bulk-actions/ba-1`, () =>
        HttpResponse.json({
          data: action({ action: 'restore', status: 'completed', succeeded: 2 }),
        }),
      ),
    )
    const { result } = renderHook(
      () =>
        useBulkActions({
          selectedIds: () => ['a', 'b'],
          selectedCount: 2,
          clearSelection: vi.fn(),
          query: { archived: true, page: 1, limit: 25 },
          total: 2,
        }),
      { wrapper },
    )

    expect(result.current.bar.archived).toBe(true)
    act(() => result.current.dialogs.restore())

    await waitFor(() => expect(received).not.toBeNull())
    expect(received).toMatchObject({
      action: 'restore',
      selection: { mode: 'ids', ids: ['a', 'b'] },
    })
  })

  it('drops the whole-filter mode as soon as the row selection changes', () => {
    let count = 2
    const { result, rerender } = renderHook(
      () =>
        useBulkActions({
          selectedIds: () => ['a', 'b'],
          selectedCount: count,
          clearSelection: vi.fn(),
          query: { page: 1, limit: 25 },
          total: 40,
        }),
      { wrapper },
    )

    act(() => result.current.bar.banner.onSelectAll())
    expect(result.current.bar.banner.allSelected).toBe(true)
    expect(result.current.dialogs.count).toBe(40)

    count = 1
    rerender()
    expect(result.current.dialogs.count).toBe(2)
    expect(result.current.bar.banner.allSelected).toBe(false)
  })

  it('does nothing when the selection is empty', () => {
    const posted = vi.fn()
    server.use(
      http.post(`${API}/bulk-actions`, () => {
        posted()
        return HttpResponse.json({ data: action({}) })
      }),
    )
    const { result } = setup([])

    act(() => result.current.dialogs.archive())

    expect(posted).not.toHaveBeenCalled()
  })

  it('reports a run that finished with errors through the error toast', async () => {
    server.use(
      http.post(`${API}/bulk-actions`, () => HttpResponse.json({ data: action({}) })),
      http.get(`${API}/bulk-actions/ba-1`, () =>
        HttpResponse.json({
          data: action({ status: 'completed_with_errors', succeeded: 1, failed: 1, processed: 2 }),
        }),
      ),
    )
    const { result } = setup()

    act(() => result.current.dialogs.setStatus('client'))

    await waitFor(() => expect(sileoError).toHaveBeenCalled())
    expect(result.current.bar.progress).toBeNull()
  })
})
