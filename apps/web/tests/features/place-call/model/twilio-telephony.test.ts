import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TelephonyError } from '@/features/place-call/model/types/call.types'

type Handler = (...args: unknown[]) => void

const sdk = vi.hoisted(() => {
  class FakeCall {
    handlers = new Map<string, Handler>()
    mute = vi.fn()
    sendDigits = vi.fn()
    disconnect = vi.fn()
    on(event: string, handler: Handler) {
      this.handlers.set(event, handler)
      return this
    }
    emit(event: string, ...args: unknown[]) {
      this.handlers.get(event)?.(...args)
    }
  }
  class FakeDevice {
    static instances: FakeDevice[] = []
    static connectImpl: () => Promise<FakeCall> = () => Promise.resolve(new FakeCall())
    handlers = new Map<string, Handler>()
    updateToken = vi.fn()
    disconnectAll = vi.fn()
    destroy = vi.fn()
    constructor(
      public token: string,
      public options: unknown,
    ) {
      FakeDevice.instances.push(this)
    }
    on(event: string, handler: Handler) {
      this.handlers.set(event, handler)
      return this
    }
    emit(event: string) {
      this.handlers.get(event)?.()
    }
    connect = vi.fn(() => FakeDevice.connectImpl())
  }
  return { FakeCall, FakeDevice }
})

vi.mock('@twilio/voice-sdk', () => ({ Device: sdk.FakeDevice }))

import { createTwilioTelephony } from '@/features/place-call/model/twilio-telephony'

function events() {
  return {
    onRinging: vi.fn<() => void>(),
    onConnected: vi.fn<() => void>(),
    onDisconnected: vi.fn<() => void>(),
    onFailed: vi.fn<(error: TelephonyError) => void>(),
  }
}

describe('createTwilioTelephony', () => {
  const fetchToken = vi.fn()

  beforeEach(() => {
    sdk.FakeDevice.instances = []
    sdk.FakeDevice.connectImpl = () => Promise.resolve(new sdk.FakeCall())
    fetchToken.mockReset().mockResolvedValue({ token: 'jwt-1', identity: 'id', expiresAt: '' })
  })

  it('creates the device once with a fetched token and connects with the number', async () => {
    const adapter = createTwilioTelephony({ fetchToken })
    await adapter.connect('+573001234567', events())
    await adapter.connect('+573001234568', events())

    expect(fetchToken).toHaveBeenCalledTimes(1)
    expect(sdk.FakeDevice.instances).toHaveLength(1)
    const device = sdk.FakeDevice.instances[0]!
    expect(device.token).toBe('jwt-1')
    expect(device.connect).toHaveBeenNthCalledWith(1, { params: { To: '+573001234567' } })
  })

  it('refreshes the token when the SDK says it will expire', async () => {
    const adapter = createTwilioTelephony({ fetchToken })
    await adapter.connect('+57', events())
    fetchToken.mockResolvedValueOnce({ token: 'jwt-2', identity: 'id', expiresAt: '' })

    const device = sdk.FakeDevice.instances[0]!
    device.emit('tokenWillExpire')
    await vi.waitFor(() => expect(device.updateToken).toHaveBeenCalledWith('jwt-2'))
  })

  it('forwards call lifecycle events to the port', async () => {
    const call = new sdk.FakeCall()
    sdk.FakeDevice.connectImpl = () => Promise.resolve(call)
    const adapter = createTwilioTelephony({ fetchToken })
    const listeners = events()
    await adapter.connect('+57', listeners)

    call.emit('ringing')
    call.emit('accept')
    expect(listeners.onRinging).toHaveBeenCalledOnce()
    expect(listeners.onConnected).toHaveBeenCalledOnce()

    adapter.setMuted(true)
    adapter.sendDigit('5')
    expect(call.mute).toHaveBeenCalledWith(true)
    expect(call.sendDigits).toHaveBeenCalledWith('5')

    call.emit('disconnect')
    expect(listeners.onDisconnected).toHaveBeenCalledOnce()
    adapter.setMuted(false)
    expect(call.mute).toHaveBeenCalledTimes(1)
  })

  it('maps reject and error events to normalized failures', async () => {
    const call = new sdk.FakeCall()
    sdk.FakeDevice.connectImpl = () => Promise.resolve(call)
    const adapter = createTwilioTelephony({ fetchToken })
    const listeners = events()
    await adapter.connect('+57', listeners)

    call.emit('error', { code: 31486 })
    expect(listeners.onFailed).toHaveBeenCalledWith('busy')
    call.emit('reject')
    expect(listeners.onFailed).toHaveBeenCalledWith('callRejected')
  })

  it('reports a failure instead of throwing when the token or device cannot be obtained', async () => {
    fetchToken.mockRejectedValueOnce({ code: 20104 })
    const adapter = createTwilioTelephony({ fetchToken })
    const listeners = events()
    await expect(adapter.connect('+57', listeners)).resolves.toBeUndefined()
    expect(listeners.onFailed).toHaveBeenCalledWith('tokenExpired')
  })

  it('destroys the device on dispose and rebuilds it on the next call', async () => {
    const adapter = createTwilioTelephony({ fetchToken })
    await adapter.connect('+57', events())
    adapter.dispose()
    expect(sdk.FakeDevice.instances[0]!.destroy).toHaveBeenCalledOnce()

    await adapter.connect('+57', events())
    expect(sdk.FakeDevice.instances).toHaveLength(2)
    expect(fetchToken).toHaveBeenCalledTimes(2)
  })

  it('hangs up every call on disconnect', async () => {
    const adapter = createTwilioTelephony({ fetchToken })
    await adapter.connect('+57', events())
    await adapter.disconnect()
    expect(sdk.FakeDevice.instances[0]!.disconnectAll).toHaveBeenCalledOnce()
  })
})
