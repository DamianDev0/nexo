import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createStubTelephony } from '@/features/place-call/model/telephony-adapter'

describe('createStubTelephony', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('connects after the configured delay', async () => {
    const adapter = createStubTelephony(1000)
    const onConnected = vi.fn()
    await adapter.connect('3001234567', { onConnected, onDisconnected: vi.fn() })

    expect(onConnected).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(onConnected).toHaveBeenCalledOnce()
  })

  it('rejects an empty number', async () => {
    const adapter = createStubTelephony(1000)
    await expect(
      adapter.connect('', { onConnected: vi.fn(), onDisconnected: vi.fn() }),
    ).rejects.toThrow('empty dial number')
  })

  it('fires onDisconnected when hanging up an active session', async () => {
    const adapter = createStubTelephony(1000)
    const onDisconnected = vi.fn()
    await adapter.connect('3001234567', { onConnected: vi.fn(), onDisconnected })
    vi.advanceTimersByTime(1000)

    await adapter.disconnect()
    expect(onDisconnected).toHaveBeenCalledOnce()
  })

  it('cancels a pending connection when hanging up early', async () => {
    const adapter = createStubTelephony(1000)
    const onConnected = vi.fn()
    const onDisconnected = vi.fn()
    await adapter.connect('3001234567', { onConnected, onDisconnected })

    await adapter.disconnect()
    vi.advanceTimersByTime(2000)

    expect(onConnected).not.toHaveBeenCalled()
    expect(onDisconnected).toHaveBeenCalledOnce()
  })

  it('does nothing when disconnecting without a session', async () => {
    const adapter = createStubTelephony(1000)
    await expect(adapter.disconnect()).resolves.toBeUndefined()
  })
})
