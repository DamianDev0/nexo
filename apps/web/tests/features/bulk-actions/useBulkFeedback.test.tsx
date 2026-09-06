import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { BulkAction } from '@repo/shared-types'

import { useBulkFeedback } from '@/features/bulk-actions/model/useBulkFeedback'

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

function action(overrides: Partial<BulkAction>): BulkAction {
  return {
    id: 'ba-1',
    entity: 'contacts',
    action: 'archive',
    params: {},
    status: 'completed',
    total: 2,
    processed: 2,
    succeeded: 2,
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

describe('useBulkFeedback', () => {
  beforeEach(() => {
    sileoSuccess.mockClear()
    sileoError.mockClear()
    sileoInfo.mockClear()
  })

  it('announces a finished action once, with an undo button when revertible', async () => {
    const onAnnounced = vi.fn()
    const finished = action({})
    const { rerender } = renderHook(
      ({ current }: { current: BulkAction | null }) =>
        useBulkFeedback({ finished: current, onAnnounced, onUndoQueued: vi.fn() }),
      { wrapper, initialProps: { current: finished } },
    )

    await waitFor(() => expect(sileoSuccess).toHaveBeenCalledOnce())
    expect(sileoSuccess.mock.calls[0]?.[0]).toMatchObject({
      button: { title: 'contacts.bulk.toasts.undo' },
    })
    expect(onAnnounced).toHaveBeenCalledOnce()

    rerender({ current: finished })
    expect(sileoSuccess).toHaveBeenCalledOnce()
  })

  it('reports failures through the error toast without a button', async () => {
    renderHook(
      () =>
        useBulkFeedback({
          finished: action({ status: 'failed', succeeded: 0, failed: 2 }),
          onAnnounced: vi.fn(),
          onUndoQueued: vi.fn(),
        }),
      { wrapper },
    )
    await waitFor(() => expect(sileoError).toHaveBeenCalledOnce())
    expect(sileoError.mock.calls[0]?.[0]).not.toHaveProperty('button')
  })

  it('queues a revert when undo is pressed and hands the new job back', async () => {
    let reverted = false
    server.use(
      http.post(`${API}/bulk-actions/ba-1/revert`, () => {
        reverted = true
        return HttpResponse.json({ data: action({ id: 'ba-2', action: 'revert' }) })
      }),
    )
    const onUndoQueued = vi.fn()
    renderHook(
      () => useBulkFeedback({ finished: action({}), onAnnounced: vi.fn(), onUndoQueued }),
      { wrapper },
    )
    await waitFor(() => expect(sileoSuccess).toHaveBeenCalledOnce())
    const toast = sileoSuccess.mock.calls[0]?.[0] as { button: { onClick: () => void } }
    toast.button.onClick()
    await waitFor(() => expect(reverted).toBe(true))
    await waitFor(() =>
      expect(onUndoQueued).toHaveBeenCalledWith(expect.objectContaining({ id: 'ba-2' })),
    )
    expect(sileoInfo).toHaveBeenCalledOnce()
  })
})
