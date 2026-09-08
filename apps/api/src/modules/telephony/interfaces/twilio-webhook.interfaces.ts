export interface VoiceRequest {
  callSid: string
  identity: string
  to: string
}

export interface StatusCallback {
  callSid: string
  parentCallSid: string | null
  identity: string | null
  twilioStatus: string
  durationSeconds: number
  sequence: number | null
}

export interface DialAction {
  callSid: string
  twilioStatus: string
  durationSeconds: number
}

export interface VoiceIdentity {
  tenantId: string
  userId: string
}
