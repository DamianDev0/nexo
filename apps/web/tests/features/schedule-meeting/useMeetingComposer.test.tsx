import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API, createMswServer } from '../../msw/test-server'
import { queryWrapper as wrapper } from '../../query-wrapper'

import { useMeetingComposer } from '@/features/schedule-meeting/model/useMeetingComposer'

const server = createMswServer()

describe('useMeetingComposer', () => {
  it('opens on a one hour meeting', () => {
    const { result } = renderHook(() => useMeetingComposer('c1', () => undefined), { wrapper })

    expect(result.current.durationMinutes).toBe(60)
  })

  it('follows the times the user picks', async () => {
    const { result } = renderHook(() => useMeetingComposer('c1', () => undefined), { wrapper })

    act(() => result.current.form.setValue('endTime', '11:30'))

    await waitFor(() => expect(result.current.durationMinutes).toBe(150))
  })

  it('refuses to send a meeting with no subject', async () => {
    let sent = 0
    server.use(
      http.post(`${API}/activities`, () => {
        sent += 1
        return HttpResponse.json({ data: { id: 'a1' } })
      }),
    )
    const { result } = renderHook(() => useMeetingComposer('c1', () => undefined), { wrapper })

    await act(async () => {
      await result.current.submit()
    })

    expect(sent).toBe(0)
  })

  it('closes the composer once the meeting is filed', async () => {
    let closed = false
    server.use(http.post(`${API}/activities`, () => HttpResponse.json({ data: { id: 'a1' } })))
    const { result } = renderHook(
      () =>
        useMeetingComposer('c1', () => {
          closed = true
        }),
      { wrapper },
    )

    act(() => result.current.form.setValue('title', 'Visita técnica'))
    await act(async () => {
      await result.current.submit()
    })

    await waitFor(() => expect(closed).toBe(true))
  })
})
