import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useAudioDevices } from '@/features/place-call/model/useAudioDevices'

function mockDevices(devices: Partial<MediaDeviceInfo>[]) {
  const media = {
    enumerateDevices: vi.fn().mockResolvedValue(devices),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  Object.defineProperty(navigator, 'mediaDevices', { value: media, configurable: true })
  return media
}

describe('useAudioDevices', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true })
  })

  it('splits devices into mics and outputs', async () => {
    mockDevices([
      { kind: 'audioinput', deviceId: 'mic-1', label: 'AirPods Pro' },
      { kind: 'audiooutput', deviceId: 'out-1', label: 'MacBook Speakers' },
      { kind: 'videoinput', deviceId: 'cam-1', label: 'FaceTime HD' },
    ])
    const { result } = renderHook(() => useAudioDevices('Device'))

    await waitFor(() => expect(result.current.mics).toHaveLength(1))
    expect(result.current.mics[0]).toEqual({ id: 'mic-1', label: 'AirPods Pro' })
    expect(result.current.outputs).toEqual([{ id: 'out-1', label: 'MacBook Speakers' }])
  })

  it('drops permission-less placeholder devices with empty ids', async () => {
    mockDevices([
      { kind: 'audioinput', deviceId: '', label: '' },
      { kind: 'audiooutput', deviceId: 'out-1', label: 'Speakers' },
    ])
    const { result } = renderHook(() => useAudioDevices('Device'))

    await waitFor(() => expect(result.current.outputs).toHaveLength(1))
    expect(result.current.mics).toEqual([])
  })

  it('falls back to a numbered label when permissions hide names', async () => {
    mockDevices([{ kind: 'audioinput', deviceId: 'mic-1', label: '' }])
    const { result } = renderHook(() => useAudioDevices('Device'))

    await waitFor(() => expect(result.current.mics).toHaveLength(1))
    expect(result.current.mics[0]?.label).toBe('Device 1')
  })

  it('subscribes to devicechange and cleans up on unmount', async () => {
    const media = mockDevices([])
    const { unmount } = renderHook(() => useAudioDevices('Device'))

    await waitFor(() => expect(media.addEventListener).toHaveBeenCalledOnce())
    unmount()
    expect(media.removeEventListener).toHaveBeenCalledOnce()
  })

  it('stays empty when the API is unavailable', () => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true })
    const { result } = renderHook(() => useAudioDevices('Device'))

    expect(result.current.mics).toEqual([])
    expect(result.current.outputs).toEqual([])
  })
})
