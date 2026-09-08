export type CallProvider = 'twilio'

export type CallDirection = 'outbound' | 'inbound'

export type CallStatus =
  | 'initiated'
  | 'ringing'
  | 'in_progress'
  | 'completed'
  | 'busy'
  | 'no_answer'
  | 'failed'
  | 'canceled'

export type Call = {
  id: string
  provider: CallProvider
  providerCallSid: string
  direction: CallDirection
  status: CallStatus
  fromNumber: string
  toNumber: string
  contactId: string | null
  userId: string | null
  startedAt: string
  answeredAt: string | null
  endedAt: string | null
  durationSeconds: number
  createdAt: string
}

export type VoiceToken = {
  token: string
  identity: string
  expiresAt: string
}
