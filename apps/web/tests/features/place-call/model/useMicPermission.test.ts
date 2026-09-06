import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useMicPermission } from '@/features/place-call/model/useMicPermission'

function mockPermissions(state: PermissionState) {
  Object.defineProperty(navigator, 'permissions', {
    value: { query: vi.fn().mockResolvedValue({ state }) },
    configurable: true,
  })
}

function mockGetUserMedia(impl: () => Promise<{ getTracks: () => { stop: () => void }[] }>) {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: vi.fn().mockImplementation(impl) },
    configurable: true,
  })
}

describe('useMicPermission', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'permissions', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true })
  })

  it('reads an already granted permission on mount', async () => {
    mockPermissions('granted')
    const { result } = renderHook(() => useMicPermission())

    await waitFor(() => expect(result.current.state).toBe('granted'))
  })

  it('reads a denied permission on mount', async () => {
    mockPermissions('denied')
    const { result } = renderHook(() => useMicPermission())

    await waitFor(() => expect(result.current.state).toBe('denied'))
  })

  it('stays unknown when the permissions API is missing', () => {
    const { result } = renderHook(() => useMicPermission())
    expect(result.current.state).toBe('unknown')
  })

  it('grants after a successful getUserMedia request and stops the tracks', async () => {
    const stop = vi.fn()
    mockGetUserMedia(() => Promise.resolve({ getTracks: () => [{ stop }] }))
    const { result } = renderHook(() => useMicPermission())

    let granted = false
    await act(async () => {
      granted = await result.current.request()
    })

    expect(granted).toBe(true)
    expect(result.current.state).toBe('granted')
    expect(stop).toHaveBeenCalledOnce()
  })

  it('marks denied when the user rejects the prompt', async () => {
    mockGetUserMedia(() => Promise.reject(new Error('denied')))
    const { result } = renderHook(() => useMicPermission())

    let granted = true
    await act(async () => {
      granted = await result.current.request()
    })

    expect(granted).toBe(false)
    expect(result.current.state).toBe('denied')
  })
})
