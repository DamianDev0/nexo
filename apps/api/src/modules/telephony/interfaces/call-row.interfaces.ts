import type { CallStatus } from '@repo/shared-types'

export interface CallRow {
  id: string
  provider: string
  provider_call_sid: string
  direction: string
  status: string
  from_number: string
  to_number: string
  contact_id: string | null
  user_id: string | null
  started_at: string
  answered_at: string | null
  ended_at: string | null
  duration_seconds: number
  created_at: string
}

export interface CallInsertValues {
  providerCallSid: string
  fromNumber: string
  toNumber: string
  contactId: string | null
  userId: string
}

export interface CallProgress {
  providerCallSid: string
  status: CallStatus
  sequence: number | null
}

export interface CallOutcome {
  providerCallSid: string
  status: CallStatus
  durationSeconds: number
}

export interface CallListFilters {
  contactId?: string
  userId?: string
  limit: number
}
