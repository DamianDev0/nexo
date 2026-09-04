export type CallStatus = 'idle' | 'connecting' | 'active' | 'ended'

export type CallOutcome = 'completed' | 'canceled'

export type CallLogEntry = {
  readonly id: string
  readonly number: string
  readonly at: number
  readonly durationSec: number
  readonly outcome: CallOutcome
}

export type DockTab = 'dialpad' | 'calls' | 'contacts'

export type TelephonyEvents = {
  readonly onConnected: () => void
  readonly onDisconnected: () => void
}

export type TelephonyAdapter = {
  readonly connect: (number: string, events: TelephonyEvents) => Promise<void>
  readonly disconnect: () => Promise<void>
  readonly setMuted: (muted: boolean) => void
  readonly setHeld: (held: boolean) => void
  readonly sendDigit: (digit: string) => void
}
