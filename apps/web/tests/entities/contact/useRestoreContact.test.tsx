import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useRestoreContact } from '@/entities/contact/query/useRestoreContact'

const sileoSuccess = vi.fn()
vi.mock('sileo', () => ({
  sileo: { success: (...args: unknown[]) => sileoSuccess(...args), error: vi.fn() },
}))

const server = createMswServer()

describe('useRestoreContact', () => {
  it('posts the restore for the contact and celebrates', async () => {
    const restored: string[] = []
    server.use(
      http.post(`${API}/contacts/:id/restore`, ({ params }) => {
        restored.push(String(params.id))
        return HttpResponse.json({ data: CONTACTS_FIXTURE[0] })
      }),
      http.get(`${API}/settings/nomenclature`, () => HttpResponse.json({ data: {} })),
    )
    const { result } = renderHook(() => useRestoreContact(), { wrapper })

    act(() => result.current({ ...CONTACTS_FIXTURE[0]!, isActive: false }))

    await waitFor(() => expect(restored).toEqual(['contact-1']))
    await waitFor(() => expect(sileoSuccess).toHaveBeenCalled())
  })
})
