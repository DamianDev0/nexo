import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { API, createMswServer } from '../../msw/test-server'
import { contactObjectWrapper as wrapper } from '../../object-wrapper'

import { useRestoreRecord } from '@/features/archive-record'

const sileoSuccess = vi.fn()
vi.mock('sileo', () => ({
  sileo: { success: (...args: unknown[]) => sileoSuccess(...args), error: vi.fn() },
}))

const server = createMswServer()

describe('useRestoreRecord', () => {
  it('posts the restore for the contact and celebrates', async () => {
    const restored: string[] = []
    server.use(
      http.post(`${API}/contacts/:id/restore`, ({ params }) => {
        restored.push(String(params.id))
        return HttpResponse.json({ data: CONTACTS_FIXTURE[0] })
      }),
      http.get(`${API}/settings/nomenclature`, () => HttpResponse.json({ data: {} })),
    )
    const { result } = renderHook(() => useRestoreRecord(), { wrapper })

    act(() => result.current(CONTACTS_FIXTURE[0]!))

    await waitFor(() => expect(restored).toEqual(['contact-1']))
    await waitFor(() => expect(sileoSuccess).toHaveBeenCalled())
  })
})
