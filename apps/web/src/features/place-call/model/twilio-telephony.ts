import { toTelephonyError } from '../lib/telephony-error'

import type { TelephonyAdapter, TelephonyEvents } from './types/call.types'
import type { VoiceToken } from '@repo/shared-types'
import type { Call, Device } from '@twilio/voice-sdk'

type TwilioTelephonyDeps = {
  readonly fetchToken: () => Promise<VoiceToken>
}

const DEVICE_OPTIONS: Device.Options = { logLevel: 'error', closeProtection: true }

function bindCallEvents(call: Call, events: TelephonyEvents, release: () => void): void {
  call.on('ringing', events.onRinging)
  call.on('accept', events.onConnected)
  call.on('disconnect', () => {
    release()
    events.onDisconnected()
  })
  call.on('cancel', () => {
    release()
    events.onDisconnected()
  })
  call.on('reject', () => {
    release()
    events.onFailed('callRejected')
  })
  call.on('error', (error: unknown) => {
    release()
    events.onFailed(toTelephonyError(error))
  })
}

export function createTwilioTelephony({ fetchToken }: TwilioTelephonyDeps): TelephonyAdapter {
  let device: Device | null = null
  let call: Call | null = null

  const ensureDevice = async (): Promise<Device> => {
    if (device !== null) return device
    const [{ Device: TwilioDevice }, { token }] = await Promise.all([
      import('@twilio/voice-sdk'),
      fetchToken(),
    ])
    const created = new TwilioDevice(token, DEVICE_OPTIONS)
    created.on('tokenWillExpire', () => {
      void fetchToken().then((next) => created.updateToken(next.token))
    })
    device = created
    return created
  }

  const release = () => {
    call = null
  }

  return {
    connect: async (number, events) => {
      try {
        const ready = await ensureDevice()
        const active = await ready.connect({ params: { To: number } })
        call = active
        bindCallEvents(active, events, release)
      } catch (error) {
        release()
        events.onFailed(toTelephonyError(error))
      }
    },
    disconnect: () => {
      device?.disconnectAll()
      release()
      return Promise.resolve()
    },
    dispose: () => {
      device?.destroy()
      device = null
      release()
    },
    setMuted: (muted) => call?.mute(muted),
    setHeld: () => undefined,
    setRecording: () => undefined,
    sendDigit: (digit) => call?.sendDigits(digit),
  }
}
