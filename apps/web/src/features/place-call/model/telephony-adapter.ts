import type { TelephonyAdapter, TelephonyEvents } from './types/call.types'

export function createStubTelephony(connectDelayMs: number): TelephonyAdapter {
  let timer: ReturnType<typeof setTimeout> | null = null
  let session: TelephonyEvents | null = null

  return {
    connect: (number, events) => {
      if (number === '') return Promise.reject(new Error('empty dial number'))
      session = events
      timer = setTimeout(() => {
        session?.onConnected()
      }, connectDelayMs)
      return Promise.resolve()
    },
    disconnect: () => {
      if (timer !== null) clearTimeout(timer)
      timer = null
      const events = session
      session = null
      events?.onDisconnected()
      return Promise.resolve()
    },
    setMuted: () => undefined,
    setHeld: () => undefined,
    setRecording: () => undefined,
    sendDigit: () => undefined,
  }
}
