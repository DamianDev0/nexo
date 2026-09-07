import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useActivityComposer } from '@/features/log-contact-activity/model/useActivityComposer'

const server = createMswServer()

describe('useActivityComposer', () => {
  it('starts with an empty title on today at the default time', () => {
    const { result } = renderHook(() => useActivityComposer('task', 'c1', vi.fn()), { wrapper })
    const values = result.current.form.getValues()
    expect(values.title).toBe('')
    expect(values.time).toBe('09:00')
    expect(values.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('does not post when the title is empty', async () => {
    const onDone = vi.fn()
    const { result } = renderHook(() => useActivityComposer('task', 'c1', onDone), { wrapper })
    await act(() => result.current.submit())
    expect(onDone).not.toHaveBeenCalled()
    const valid = await act(() => result.current.form.trigger('title'))
    expect(valid).toBe(false)
  })

  it('posts the activity with the contact and calls onDone', async () => {
    const bodies: unknown[] = []
    server.use(
      http.post(`${API}/activities`, async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json({ data: { id: 'a1' } })
      }),
    )
    const onDone = vi.fn()
    const { result } = renderHook(() => useActivityComposer('meeting', 'c1', onDone), { wrapper })
    act(() => {
      result.current.form.setValue('title', 'Visita comercial')
      result.current.form.setValue('dueDate', '2026-09-10')
      result.current.form.setValue('time', '10:00')
    })
    await act(() => result.current.submit())
    await waitFor(() => expect(onDone).toHaveBeenCalledOnce())
    expect(bodies).toEqual([
      {
        activityType: 'meeting',
        contactId: 'c1',
        title: 'Visita comercial',
        dueDate: '2026-09-10T15:00:00.000Z',
      },
    ])
  })
})
