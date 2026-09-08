import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { queryWrapper } from '../../../query-wrapper'

import type {
  TelephonyAdapter,
  TelephonyEvents,
} from '@/features/place-call/model/types/call.types'

import { DIALER_TIMINGS } from '@/features/place-call/config/dialer.config'
import { useCallStore } from '@/features/place-call/model/call.store'
import { useDialer } from '@/features/place-call/model/useDialer'

const fake = vi.hoisted(() => ({
  events: null as TelephonyEvents | null,
  adapter: null as
    | (TelephonyAdapter & {
        disconnect: ReturnType<typeof vi.fn>
        dispose: ReturnType<typeof vi.fn>
      })
    | null,
}))

vi.mock('@/features/place-call/model/twilio-telephony', () => ({
  createTwilioTelephony: () => {
    const adapter = {
      connect: vi.fn((_number: string, events: TelephonyEvents) => {
        fake.events = events
        return Promise.resolve()
      }),
      disconnect: vi.fn(() => {
        fake.events?.onDisconnected()
        return Promise.resolve()
      }),
      dispose: vi.fn(),
      setMuted: vi.fn(),
      setHeld: vi.fn(),
      setRecording: vi.fn(),
      sendDigit: vi.fn(),
    }
    fake.adapter = adapter
    return adapter
  },
}))

function answer() {
  act(() => fake.events?.onConnected())
}

describe('useDialer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useCallStore.setState({
      open: false,
      status: 'idle',
      error: null,
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
    fake.events = null
    fake.adapter = null
  })

  function dialedHook(number = '3001234567') {
    const rendered = renderHook(() => useDialer(), { wrapper: queryWrapper })
    act(() => {
      rendered.result.current.setOpen(true)
      for (const digit of number) rendered.result.current.appendDigit(digit)
    })
    return rendered
  }

  it('moves through connecting and ringing into active when the call is answered', async () => {
    const { result } = dialedHook()

    await act(async () => result.current.placeCall())
    expect(result.current.status).toBe('connecting')

    act(() => fake.events?.onRinging())
    expect(result.current.status).toBe('ringing')

    answer()
    expect(result.current.status).toBe('active')
  })

  it('refuses to place a call without a number', async () => {
    const { result } = dialedHook('')

    await act(async () => result.current.placeCall())
    expect(result.current.status).toBe('idle')
    expect(fake.adapter).toBeNull()
  })

  it('counts call seconds while active', async () => {
    const { result } = dialedHook()

    await act(async () => result.current.placeCall())
    answer()
    act(() => vi.advanceTimersByTime(3000))

    expect(result.current.seconds).toBe(3)
  })

  it('ends the call on hang up and auto-resets to idle', async () => {
    const { result } = dialedHook()

    await act(async () => result.current.placeCall())
    answer()
    await act(async () => result.current.hangUp())

    expect(result.current.status).toBe('ended')

    act(() => vi.advanceTimersByTime(DIALER_TIMINGS.resetMs))
    expect(result.current.status).toBe('idle')
    expect(result.current.number).toBe('')
    expect(result.current.seconds).toBe(0)
  })

  it('surfaces a normalized failure and auto-resets', async () => {
    const { result } = dialedHook()

    await act(async () => result.current.placeCall())
    act(() => fake.events?.onFailed('busy'))

    expect(result.current.status).toBe('failed')
    expect(result.current.error).toBe('busy')

    act(() => vi.advanceTimersByTime(DIALER_TIMINGS.resetMs))
    expect(result.current.status).toBe('idle')
    expect(result.current.error).toBeNull()
  })

  it('dials and places a call in one step from a raw number', async () => {
    const { result } = renderHook(() => useDialer(), { wrapper: queryWrapper })

    await act(async () => result.current.callNumber('+57 300 123 4567'))

    expect(result.current.status).toBe('connecting')
    expect(result.current.number).toBe('+573001234567')
    expect(fake.adapter?.connect).toHaveBeenCalledWith('+573001234567', expect.any(Object))
  })

  it('collects dtmf digits during a call and clears them on the next call', async () => {
    const { result } = dialedHook()

    await act(async () => result.current.placeCall())
    answer()
    act(() => result.current.sendDtmf('1'))
    act(() => result.current.sendDtmf('#'))
    expect(result.current.dtmf).toBe('1#')
    expect(fake.adapter?.sendDigit).toHaveBeenCalledTimes(2)

    await act(async () => result.current.hangUp())
    act(() => vi.advanceTimersByTime(DIALER_TIMINGS.resetMs))
    await act(async () => result.current.callNumber('3001234567'))
    expect(result.current.dtmf).toBe('')
  })

  it('toggles recording state', async () => {
    const { result } = dialedHook()

    await act(async () => result.current.placeCall())
    answer()

    act(() => result.current.toggleRecord())
    expect(result.current.recording).toBe(true)

    act(() => result.current.toggleRecord())
    expect(result.current.recording).toBe(false)
  })

  it('toggles hold state', async () => {
    const { result } = dialedHook()

    await act(async () => result.current.placeCall())
    answer()

    act(() => result.current.toggleHold())
    expect(result.current.held).toBe(true)

    act(() => result.current.toggleHold())
    expect(result.current.held).toBe(false)
  })

  it('toggles mute state through the adapter', async () => {
    const { result } = dialedHook()

    await act(async () => result.current.placeCall())
    act(() => result.current.toggleMute())
    expect(result.current.muted).toBe(true)
    expect(fake.adapter?.setMuted).toHaveBeenCalledWith(true)

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
    answer()
    expect(rendered.result.current.status).toBe('active')

    rendered.unmount()

    expect(fake.adapter?.disconnect).toHaveBeenCalledTimes(1)
    await vi.waitFor(() => expect(fake.adapter?.dispose).toHaveBeenCalledTimes(1))
    expect(useCallStore.getState().status).toBe('ended')
  })

  it('ignores the keyboard while the dock is closed', () => {
    const { result } = renderHook(() => useDialer(), { wrapper: queryWrapper })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }))
    })

    expect(result.current.number).toBe('')
  })
})
