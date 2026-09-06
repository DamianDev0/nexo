import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useArchivedFields } from '@/features/manage-settings/model/useArchivedFields'

vi.mock('sileo', () => ({ sileo: { success: vi.fn(), error: vi.fn() } }))

const server = createMswServer()

function field(key: string, isActive: boolean) {
  return { key, label: key, type: 'text', required: false, unique: false, order: 1, isActive }
}

describe('useArchivedFields', () => {
  it('collects inactive fields across entities and restores them by flipping isActive', async () => {
    const patched: string[] = []
    server.use(
      http.get(`${API}/settings/custom-fields/:entity`, ({ params }) =>
        HttpResponse.json({
          data:
            params.entity === 'deals'
              ? [field('presupuesto', false)]
              : [field('eps', params.entity !== 'contacts')],
        }),
      ),
      http.patch(`${API}/settings/custom-fields/:entity/:key`, async ({ params, request }) => {
        const body = (await request.json()) as { isActive?: boolean }
        patched.push(`${String(params.entity)}:${String(params.key)}:${String(body.isActive)}`)
        return HttpResponse.json({ data: field(String(params.key), true) })
      }),
    )

    const { result } = renderHook(() => useArchivedFields(), { wrapper })

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.fields.map((item) => `${item.entity}:${item.field.key}`)).toEqual([
      'contacts:eps',
      'deals:presupuesto',
    ])

    act(() => result.current.restore(result.current.fields[0]!))
    await waitFor(() => expect(patched).toEqual(['contacts:eps:true']))
  })
})
