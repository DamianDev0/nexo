import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { CreateBulkActionInput } from '@repo/shared-types'

import { useBulkJob } from '@/features/bulk-actions/model/useBulkJob'

vi.mock('sileo', () => ({ sileo: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }))

const server = createMswServer()

function action(overrides: Record<string, unknown>) {
  return {
    id: 'ba-1',
    entity: 'contacts',
    action: 'archive',
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

const REQUEST: CreateBulkActionInput = {
  entity: 'contacts',
  action: 'archive',
  params: {},
  selection: { mode: 'ids', ids: ['a', 'b'] },
}

describe('useBulkJob', () => {
  it('starts a job, tracks it while active and reports it once finished', async () => {
    let polls = 0
    server.use(
      http.post(`${API}/bulk-actions`, () => HttpResponse.json({ data: action({}) })),
      http.get(`${API}/bulk-actions/ba-1`, () => {
        polls += 1
        return HttpResponse.json({
          data: action(polls === 1 ? { status: 'running', processed: 1 } : { status: 'completed' }),
        })
      }),
    )
    const onQueued = vi.fn()
    const { result } = renderHook(() => useBulkJob(), { wrapper })

    act(() => result.current.start(REQUEST, onQueued))
    await waitFor(() => expect(onQueued).toHaveBeenCalledOnce())
    await waitFor(() => expect(result.current.running?.processed).toBe(1))
    expect(result.current.isBusy).toBe(true)

    await waitFor(() => expect(result.current.finished?.status).toBe('completed'), {
      timeout: 6000,
    })
    act(() => result.current.release())
    await waitFor(() => expect(result.current.isBusy).toBe(false))
  })

  it('can track an externally created job such as a revert', async () => {
    server.use(
      http.get(`${API}/bulk-actions/ba-9`, () =>
        HttpResponse.json({ data: action({ id: 'ba-9', status: 'completed' }) }),
      ),
    )
    const { result } = renderHook(() => useBulkJob(), { wrapper })
    act(() => result.current.track('ba-9'))
    await waitFor(() => expect(result.current.finished?.id).toBe('ba-9'))
  })
})
