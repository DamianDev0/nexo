import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useNoteComposer } from '@/features/add-contact-note/model/useNoteComposer'

const server = createMswServer()

describe('useNoteComposer', () => {
  it('exposes the live body length against the limit for the counter', () => {
    const { result } = renderHook(() => useNoteComposer('c1', vi.fn()), { wrapper })
    expect(result.current.bodyLength).toBe(0)
    expect(result.current.bodyMax).toBe(2000)
    act(() => result.current.form.setValue('body', 'hola'))
    expect(result.current.form.getValues('body')).toHaveLength(4)
  })

  it('does not post when the body is empty', async () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useNoteComposer('c1', onDone), { wrapper })
    await act(() => result.current.submit())
    expect(onDone).not.toHaveBeenCalled()
    const valid = await act(() => result.current.form.trigger('body'))
    expect(valid).toBe(false)
  })

  it('posts a note activity and calls onDone', async () => {
    const bodies: unknown[] = []
    server.use(
      http.post(`${API}/activities`, async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json({ data: { id: 'a1' } })
      }),
    )
    const onDone = vi.fn()
    const { result } = renderHook(() => useNoteComposer('c1', onDone), { wrapper })
    act(() => result.current.form.setValue('body', 'llamar mañana'))
    await act(() => result.current.submit())
    await waitFor(() => expect(onDone).toHaveBeenCalledOnce())
    expect(bodies).toEqual([
      {
        activityType: 'note',
        contactId: 'c1',
        title: 'llamar mañana',
        description: 'llamar mañana',
      },
    ])
  })
})
