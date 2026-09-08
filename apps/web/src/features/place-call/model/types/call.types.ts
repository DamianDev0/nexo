import type { ContactListItem } from '@repo/shared-types'

export type CallStatus = 'idle' | 'connecting' | 'ringing' | 'active' | 'ended' | 'failed'

export type CallOutcome = 'completed' | 'canceled'

export type TelephonyError =
  | 'deviceNotReady'
  | 'microphoneDenied'
  | 'invalidNumber'
  | 'callFailed'
  | 'callRejected'
  | 'busy'
  | 'networkError'
  | 'tokenExpired'
  | 'providerError'

export type CallLogEntry = {
  readonly id: string
  readonly number: string
  readonly name: string | null
  readonly at: number
  readonly durationSec: number
  readonly outcome: CallOutcome
}

export type DockScreen = 'phone' | 'messages' | 'contacts' | 'chat' | 'more'

export type PhoneTab = 'dialpad' | 'calls'

export type PresenceKey = 'available' | 'busy' | 'dnd' | 'invisible'

export type AudioDeviceKind = 'mic' | 'speaker' | 'ringer'

export type AudioPrefs = Readonly<Record<AudioDeviceKind, string | null>>

export type AudioDeviceOption = {
  readonly id: string
  readonly label: string
}

export type TelephonyEvents = {
  readonly onRinging: () => void
  readonly onConnected: () => void
  readonly onDisconnected: () => void
  readonly onFailed: (error: TelephonyError) => void
}

export type TelephonyAdapter = {
  readonly connect: (number: string, events: TelephonyEvents) => Promise<void>
  readonly disconnect: () => Promise<void>
  readonly dispose: () => void
  readonly setMuted: (muted: boolean) => void
  readonly setHeld: (held: boolean) => void
  readonly setRecording: (recording: boolean) => void
  readonly sendDigit: (digit: string) => void
}

export type ContactGroup = {
  readonly letter: string
  readonly contacts: readonly ContactListItem[]
}
