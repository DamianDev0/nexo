import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useBulkHistory } from '@/features/bulk-actions/model/useBulkHistory'

const server = createMswServer()

function row(id: string, status = 'completed') {
  return {
    id,
    entity: 'contacts',
    action: 'archive',
    params: {},
    status,
    total: 1,
    processed: 1,
    succeeded: 1,
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
  }
}

describe('useBulkHistory', () => {
  it('lists the history, cancels an active run and reverts a finished one', async () => {
    const cancelled: string[] = []
    const reverted: string[] = []
    server.use(
      http.get(`${API}/bulk-actions`, () =>
        HttpResponse.json({
          data: { data: [row('a', 'running'), row('b')], total: 30, page: 1, limit: 25 },
        }),
      ),
      http.post(`${API}/bulk-actions/:id/cancel`, ({ params }) => {
        cancelled.push(String(params.id))
        return HttpResponse.json({ data: row('a', 'cancelled') })
      }),
      http.post(`${API}/bulk-actions/:id/revert`, ({ params }) => {
        reverted.push(String(params.id))
        return HttpResponse.json({ data: row('b') })
      }),
    )

    const { result } = renderHook(() => useBulkHistory(), { wrapper })

    await waitFor(() => expect(result.current.rows).toHaveLength(2))
    expect(result.current.pagination.totalPages).toBe(2)

    act(() => result.current.rowActions.onCancel('a'))
    await waitFor(() => expect(cancelled).toEqual(['a']))

    const target = result.current.rows[1]
    if (!target) throw new Error('missing row')
    act(() => result.current.rowActions.onRevert(target))
    expect(result.current.revertDialog.action?.id).toBe('b')
    expect(reverted).toEqual([])

    act(() => result.current.revertDialog.confirm())
    await waitFor(() => expect(reverted).toEqual(['b']))
    expect(result.current.revertDialog.action).toBeNull()
  })
})
