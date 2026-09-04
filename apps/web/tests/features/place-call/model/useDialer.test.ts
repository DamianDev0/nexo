import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { vi } from 'vitest'

import type { TelephonyAdapter } from '@/features/place-call/model/types/call.types'

import { DIALER_TIMINGS } from '@/features/place-call/config/dialer.config'
import { useCallStore } from '@/features/place-call/model/call.store'
import { useDialer } from '@/features/place-call/model/useDialer'

const lastAdapter = vi.hoisted(() => ({ current: null as TelephonyAdapter | null }))

vi.mock('@/features/place-call/model/telephony-adapter', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/place-call/model/telephony-adapter')>()
  return {
    createStubTelephony: (connectDelayMs: number) => {
      const adapter = actual.createStubTelephony(connectDelayMs)
      vi.spyOn(adapter, 'disconnect')
      lastAdapter.current = adapter
      return adapter
    },
  }
})

describe('useDialer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useCallStore.setState({
      open: false,
      status: 'idle',
      number: '',
      muted: false,
      held: false,
      startedAt: null,
      history: [],
    })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    lastAdapter.current = null
  })

  function dialedHook(number = '3001234567') {
    const rendered = renderHook(() => useDialer())
    act(() => {
      rendered.result.current.setOpen(true)
      for (const digit of number) rendered.result.current.appendDigit(digit)
    })
    return rendered
  }

  it('moves through connecting into active when the call connects', async () => {
    const { result } = dialedHook()

    await act(async () => result.current.placeCall())
    expect(result.current.status).toBe('connecting')

    act(() => vi.advanceTimersByTime(DIALER_TIMINGS.connectMs))
    expect(result.current.status).toBe('active')
  })

  it('refuses to place a call without a number', async () => {
    const { result } = dialedHook('')

    await act(async () => result.current.placeCall())
    expect(result.current.status).toBe('idle')
  })

  it('counts call seconds while active', async () => {
    const { result } = dialedHook()

    await act(async () => result.current.placeCall())
    act(() => vi.advanceTimersByTime(DIALER_TIMINGS.connectMs))
    act(() => vi.advanceTimersByTime(3000))

    expect(result.current.seconds).toBe(3)
  })

  it('ends the call on hang up and auto-resets to idle', async () => {
    const { result } = dialedHook()

    await act(async () => result.current.placeCall())
    act(() => vi.advanceTimersByTime(DIALER_TIMINGS.connectMs))
    await act(async () => result.current.hangUp())

    expect(result.current.status).toBe('ended')

    act(() => vi.advanceTimersByTime(DIALER_TIMINGS.resetMs))
    expect(result.current.status).toBe('idle')
    expect(result.current.number).toBe('')
    expect(result.current.seconds).toBe(0)
  })

  it('dials and places a call in one step from a raw number', async () => {
    const { result } = renderHook(() => useDialer())

    await act(async () => result.current.callNumber('+57 300 123 4567'))

    expect(result.current.status).toBe('connecting')
    expect(result.current.number).toBe('+573001234567')
  })

  it('collects dtmf digits during a call and clears them on the next call', async () => {
    const { result } = dialedHook()

    await act(async () => result.current.placeCall())
    act(() => vi.advanceTimersByTime(DIALER_TIMINGS.connectMs))
    act(() => result.current.sendDtmf('1'))
    act(() => result.current.sendDtmf('#'))
    expect(result.current.dtmf).toBe('1#')

    await act(async () => result.current.hangUp())
    act(() => vi.advanceTimersByTime(DIALER_TIMINGS.resetMs))
    await act(async () => result.current.callNumber('3001234567'))
    expect(result.current.dtmf).toBe('')
  })

  it('toggles hold state', async () => {
    const { result } = dialedHook()

    await act(async () => result.current.placeCall())
    act(() => vi.advanceTimersByTime(DIALER_TIMINGS.connectMs))

    act(() => result.current.toggleHold())
    expect(result.current.held).toBe(true)

    act(() => result.current.toggleHold())
    expect(result.current.held).toBe(false)
  })

  it('toggles mute state', () => {
    const { result } = dialedHook()

    act(() => result.current.toggleMute())
    expect(result.current.muted).toBe(true)

    act(() => result.current.toggleMute())
    expect(result.current.muted).toBe(false)
  })

  it('types digits from the physical keyboard while open and idle', () => {
    const { result } = dialedHook('')

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '0' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }))
    })

    expect(result.current.number).toBe('3')
  })

  it('disconnects the adapter on unmount during an active call', async () => {
    const rendered = dialedHook()

    await act(async () => rendered.result.current.placeCall())
    act(() => vi.advanceTimersByTime(DIALER_TIMINGS.connectMs))
    expect(rendered.result.current.status).toBe('active')

    rendered.unmount()

    expect(lastAdapter.current?.disconnect).toHaveBeenCalledTimes(1)
    expect(useCallStore.getState().status).toBe('ended')
  })

  it('ignores the keyboard while the dock is closed', () => {
    const { result } = renderHook(() => useDialer())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }))
    })

    expect(result.current.number).toBe('')
  })
})
