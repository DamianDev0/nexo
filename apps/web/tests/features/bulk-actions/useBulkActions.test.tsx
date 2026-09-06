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

const FILTER = { mode: 'filter', query: { status: 'new' } } as const

function setup(ids: string[] = ['a', 'b'], total = 40, archived = false) {
  const clear = vi.fn()
  const hook = renderHook(
    () =>
      useBulkActions({
        archived,
        total,
        rows: {
          selectedIds: () => ids,
          selectedTags: () => ['vip', 'seed'],
          selectedCount: ids.length,
          clear,
        },
        filterSelection: () => FILTER,
      }),
    { wrapper },
  )
  return { ...hook, clear }
}

function captureCreate() {
  const received: Array<Record<string, unknown>> = []
  server.use(
    http.post(`${API}/bulk-actions`, async ({ request }) => {
      received.push((await request.json()) as Record<string, unknown>)
      return HttpResponse.json({ data: action({ status: 'completed', succeeded: 2 }) })
    }),
    http.get(`${API}/bulk-actions/ba-1`, () =>
      HttpResponse.json({ data: action({ status: 'completed', succeeded: 2 }) }),
    ),
  )
  return received
}

beforeEach(() => {
  sileoSuccess.mockClear()
  sileoError.mockClear()
  sileoInfo.mockClear()
})

describe('useBulkActions', () => {
  it('exposes the registry actions for the current list scope', () => {
    expect(setup().result.current.bar.actions.map((def) => def.id)).toContain('assign')
    expect(setup(['a'], 1, true).result.current.bar.actions.map((def) => def.id)).toEqual([
      'restore',
      'export',
    ])
  })

  it('submits the checked ids, closes the dialog and clears the selection', async () => {
    const received = captureCreate()
    const { result, clear } = setup()

    act(() => result.current.bar.onOpen('add_tags'))
    expect(result.current.dialogs.open).toBe('add_tags')
    expect(result.current.dialogs.count).toBe(2)

    act(() => result.current.dialogs.submit('add_tags', { tags: ['vip'] }))

    await waitFor(() => expect(received).toHaveLength(1))
    expect(received[0]).toEqual({
      entity: 'contacts',
      action: 'add_tags',
      params: { tags: ['vip'] },
      selection: { mode: 'ids', ids: ['a', 'b'] },
    })
    await waitFor(() => expect(result.current.dialogs.open).toBeNull())
    expect(clear).toHaveBeenCalled()
    await waitFor(() => expect(sileoSuccess).toHaveBeenCalled())
  })

  it('targets the whole filter after select-all and merges registry params', async () => {
    const received = captureCreate()
    const { result } = setup()

    act(() => result.current.bar.onSelectAll?.())
    expect(result.current.bar.labels.selected(2)).toContain('allMatching')
    expect(result.current.dialogs.count).toBe(40)

    act(() => result.current.dialogs.submit('lifecycle', { value: 'customer' }))

    await waitFor(() => expect(received).toHaveLength(1))
    expect(received[0]).toMatchObject({
      action: 'update_field',
      params: { field: 'lifecycleStage', value: 'customer' },
      selection: FILTER,
    })
  })

  it('scopes the remove-tags dialog to the selected rows, but not in whole-filter mode', () => {
    const { result } = setup()

    act(() => result.current.bar.onOpen('remove_tags'))
    expect(result.current.dialogs.context.tags).toEqual(['vip', 'seed'])

    act(() => result.current.dialogs.close())
    act(() => result.current.bar.onSelectAll?.())
    act(() => result.current.bar.onOpen('remove_tags'))
    expect(result.current.dialogs.context.tags).toBeNull()
  })

  it('does nothing when the selection is empty', () => {
    const received = captureCreate()
    const { result } = setup([], 0)
    act(() => result.current.dialogs.submit('archive'))
    expect(received).toHaveLength(0)
  })
})
