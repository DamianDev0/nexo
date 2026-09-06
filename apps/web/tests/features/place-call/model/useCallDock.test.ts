import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useCallStore } from '@/features/place-call/model/call.store'
import { useCallDock } from '@/features/place-call/model/useCallDock'

describe('useCallDock', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'permissions', {
      value: { query: vi.fn().mockResolvedValue({ state: 'granted' }) },
      configurable: true,
    })
    useCallStore.setState({
      open: true,
      hidden: false,
      status: 'idle',
      number: '',
      callerName: null,
      muted: false,
      held: false,
      startedAt: null,
      history: [],
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'permissions', { value: undefined, configurable: true })
  })

  it('starts on the phone screen with the dialpad tab', () => {
    const { result } = renderHook(() => useCallDock())

    expect(result.current.screen).toBe('phone')
    expect(result.current.phoneTab).toBe('dialpad')
  })

  it('callAndSwitch jumps back to the dialpad and dials with the caller name', async () => {
    const { result } = renderHook(() => useCallDock())
    await waitFor(() => expect(result.current.micGate.denied).toBe(false))

    act(() => result.current.setScreen('contacts'))
    await waitFor(() => {
      act(() => result.current.callAndSwitch('+573001234567', 'Marcela Rueda'))
      expect(useCallStore.getState().status).toBe('connecting')
    })

    expect(result.current.screen).toBe('phone')
    expect(result.current.phoneTab).toBe('dialpad')
    expect(useCallStore.getState().callerName).toBe('Marcela Rueda')
  })

  it('reflects in-call and expanded state from the store', () => {
    const { result } = renderHook(() => useCallDock())

    act(() => useCallStore.getState().callConnecting())
    expect(result.current.inCall).toBe(true)
    expect(result.current.expanded).toBe(true)
  })
})
