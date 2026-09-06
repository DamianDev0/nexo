import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCallStore } from '@/features/place-call/model/call.store'
import { usePhoneSettings } from '@/features/place-call/model/usePhoneSettings'

describe('usePhoneSettings', () => {
  beforeEach(() => {
    useCallStore.setState({
      open: true,
      status: 'idle',
      number: '31',
      muted: false,
      held: false,
      startedAt: null,
      history: [],
      presence: 'available',
      audio: { mic: null, speaker: null, ringer: null },
      receiveHere: true,
    })
  })

  it('changes presence', () => {
    const { result } = renderHook(() => usePhoneSettings('Device'))

    act(() => result.current.setPresence('dnd'))
    expect(result.current.presence).toBe('dnd')
  })

  it('stores the chosen audio device per kind', () => {
    const { result } = renderHook(() => usePhoneSettings('Device'))

    act(() => result.current.setAudioDevice('mic', 'mic-9'))
    act(() => result.current.setAudioDevice('ringer', 'out-2'))

    expect(result.current.audio).toEqual({ mic: 'mic-9', speaker: null, ringer: 'out-2' })
  })

  it('toggles receiving calls here', () => {
    const { result } = renderHook(() => usePhoneSettings('Device'))

    act(() => result.current.toggleReceiveHere())
    expect(result.current.receiveHere).toBe(false)
  })

  it('sign out wipes softphone state and closes the dock', () => {
    useCallStore.setState({
      presence: 'busy',
      receiveHere: false,
      history: [
        { id: 'a', number: '301', name: null, at: 1, durationSec: 3, outcome: 'completed' },
      ],
    })
    const { result } = renderHook(() => usePhoneSettings('Device'))

    act(() => result.current.signOut())

    expect(useCallStore.getState()).toMatchObject({
      open: false,
      number: '',
      history: [],
      presence: 'available',
      receiveHere: true,
    })
  })
})
