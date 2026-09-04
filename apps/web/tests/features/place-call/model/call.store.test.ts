import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DIALER_TIMINGS } from '@/features/place-call/config/dialer.config'
import { useCallStore } from '@/features/place-call/model/call.store'

describe('useCallStore', () => {
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
    vi.useRealTimers()
  })

  it('appends valid dial characters', () => {
    useCallStore.getState().appendDigit('3')
    useCallStore.getState().appendDigit('0')
    useCallStore.getState().appendDigit('*')
    expect(useCallStore.getState().number).toBe('30*')
  })

  it('rejects characters outside the dial alphabet', () => {
    useCallStore.getState().appendDigit('a')
    useCallStore.getState().appendDigit(' ')
    expect(useCallStore.getState().number).toBe('')
  })

  it('caps the number at fifteen digits', () => {
    for (let index = 0; index < 20; index += 1) useCallStore.getState().appendDigit('1')
    expect(useCallStore.getState().number).toHaveLength(15)
  })

  it('ignores digits while a call is in progress', () => {
    useCallStore.getState().callConnecting()
    useCallStore.getState().appendDigit('3')
    expect(useCallStore.getState().number).toBe('')
  })

  it('deletes the last digit only while idle', () => {
    useCallStore.getState().appendDigit('3')
    useCallStore.getState().appendDigit('0')
    useCallStore.getState().deleteDigit()
    expect(useCallStore.getState().number).toBe('3')

    useCallStore.getState().callConnecting()
    useCallStore.getState().deleteDigit()
    expect(useCallStore.getState().number).toBe('3')
  })

  it('stamps the start time when the call connects', () => {
    useCallStore.getState().callConnecting()
    useCallStore.getState().callConnected()
    expect(useCallStore.getState().status).toBe('active')
    expect(useCallStore.getState().startedAt).toBe(Date.now())
  })

  it('auto-resets to idle after a call ends', () => {
    useCallStore.getState().appendDigit('3')
    useCallStore.getState().callConnecting()
    useCallStore.getState().callConnected()
    useCallStore.getState().callEnded()

    expect(useCallStore.getState().status).toBe('ended')
    expect(useCallStore.getState().startedAt).toBeNull()

    vi.advanceTimersByTime(DIALER_TIMINGS.resetMs)
    expect(useCallStore.getState()).toMatchObject({ status: 'idle', number: '', muted: false })
  })

  it('dials a sanitized number and opens the dock', () => {
    useCallStore.getState().dialNumber('+57 300-123 4567')

    expect(useCallStore.getState().open).toBe(true)
    expect(useCallStore.getState().number).toBe('+573001234567')
  })

  it('only opens the dock when dialing during a call', () => {
    useCallStore.getState().appendDigit('9')
    useCallStore.getState().callConnecting()

    useCallStore.getState().dialNumber('3001234567')

    expect(useCallStore.getState().open).toBe(true)
    expect(useCallStore.getState().number).toBe('9')
  })

  it('toggles mute', () => {
    useCallStore.getState().toggleMuted()
    expect(useCallStore.getState().muted).toBe(true)
    useCallStore.getState().toggleMuted()
    expect(useCallStore.getState().muted).toBe(false)
  })

  it('resets call state but keeps the dock open flag', () => {
    useCallStore.getState().setOpen(true)
    useCallStore.getState().appendDigit('3')
    useCallStore.getState().callConnecting()
    useCallStore.getState().toggleMuted()

    useCallStore.getState().reset()

    expect(useCallStore.getState()).toMatchObject({
      open: true,
      status: 'idle',
      number: '',
      muted: false,
      startedAt: null,
    })
  })

  it('logs a completed call with its duration', () => {
    useCallStore.getState().appendDigit('3')
    useCallStore.getState().callConnecting()
    useCallStore.getState().callConnected()
    vi.advanceTimersByTime(65_000)
    useCallStore.getState().callEnded()

    const [entry] = useCallStore.getState().history
    expect(entry).toMatchObject({ number: '3', durationSec: 65, outcome: 'completed' })
  })

  it('logs a canceled call when it never connected', () => {
    useCallStore.getState().appendDigit('3')
    useCallStore.getState().callConnecting()
    useCallStore.getState().callEnded()

    const [entry] = useCallStore.getState().history
    expect(entry).toMatchObject({ number: '3', durationSec: 0, outcome: 'canceled' })
  })

  it('keeps the newest call first and drops hold on end', () => {
    useCallStore.getState().toggleHeld()
    expect(useCallStore.getState().held).toBe(true)

    useCallStore.getState().callEnded()
    expect(useCallStore.getState().held).toBe(false)
  })

  it('cancels the pending auto-reset when reset happens first', () => {
    useCallStore.getState().callEnded()
    useCallStore.getState().reset()
    useCallStore.getState().appendDigit('3')

    vi.advanceTimersByTime(DIALER_TIMINGS.resetMs)
    expect(useCallStore.getState().number).toBe('3')
  })
})
