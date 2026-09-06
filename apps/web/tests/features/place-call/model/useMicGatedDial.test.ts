import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useMicGatedDial } from '@/features/place-call/model/useMicGatedDial'

function mockPermissions(state: PermissionState) {
  Object.defineProperty(navigator, 'permissions', {
    value: { query: vi.fn().mockResolvedValue({ state }) },
    configurable: true,
  })
}

function mockGetUserMedia(succeeds: boolean) {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: succeeds
        ? vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] })
        : vi.fn().mockRejectedValue(new Error('denied')),
    },
    configurable: true,
  })
}

describe('useMicGatedDial', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'permissions', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true })
  })

  it('dials immediately when the mic is already granted', async () => {
    mockPermissions('granted')
    const { result } = renderHook(() => useMicGatedDial())
    await act(async () => undefined)

    const dial = vi.fn()
    act(() => result.current.requestDial(dial))

    expect(dial).toHaveBeenCalledOnce()
    expect(result.current.modalOpen).toBe(false)
  })

  it('opens the modal and replays the pending dial after allow', async () => {
    mockGetUserMedia(true)
    const { result } = renderHook(() => useMicGatedDial())

    const dial = vi.fn()
    act(() => result.current.requestDial(dial))
    expect(result.current.modalOpen).toBe(true)
    expect(dial).not.toHaveBeenCalled()

    await act(async () => result.current.allow())

    expect(dial).toHaveBeenCalledOnce()
    expect(result.current.modalOpen).toBe(false)
  })

  it('keeps the modal open and never dials when permission is refused', async () => {
    mockGetUserMedia(false)
    const { result } = renderHook(() => useMicGatedDial())

    const dial = vi.fn()
    act(() => result.current.requestDial(dial))
    await act(async () => result.current.allow())

    expect(dial).not.toHaveBeenCalled()
    expect(result.current.modalOpen).toBe(true)
    expect(result.current.denied).toBe(true)
  })

  it('dismiss drops the pending dial so a later allow does nothing', async () => {
    mockGetUserMedia(true)
    const { result } = renderHook(() => useMicGatedDial())

    const dial = vi.fn()
    act(() => result.current.requestDial(dial))
    act(() => result.current.dismiss())
    await act(async () => result.current.allow())

    expect(dial).not.toHaveBeenCalled()
  })
})
