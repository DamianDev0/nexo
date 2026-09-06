import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useContactCounts } from '@/features/filter-contacts/query/useContactCounts'

const server = createMswServer()

describe('useContactCounts', () => {
  it('exposes ownership counts alongside totals and statuses', async () => {
    server.use(
      http.get(`${API}/contacts/counts`, () =>
        HttpResponse.json({
          statusCode: 200,
          message: 'OK',
          data: {
            total: 30,
            archived: 4,
            mine: 25,
            unassigned: 3,
            unassignedRecent: 2,
            byStatus: { new: 20, qualified: 10 },
          },
          timestamp: new Date().toISOString(),
          path: '/contacts/counts',
          method: 'GET',
        }),
      ),
    )

    const { result } = renderHook(() => useContactCounts(), { wrapper })

    await waitFor(() => expect(result.current.all).toBe(30))
    expect(result.current).toMatchObject({
      all: 30,
      mine: 25,
      unassigned: 3,
      unassignedRecent: 2,
      archived: 4,
      new: 20,
      qualified: 10,
    })
  })
})
