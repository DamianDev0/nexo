import type { Call, CallDirection, CallProvider, CallStatus } from '@repo/shared-types'
import { TWILIO_CALL_STATUS } from '../constants/call.constants'
import type { CallRow } from '../interfaces/call-row.interfaces'

export function mapCall(row: CallRow): Call {
  return {
    id: row.id,
    provider: row.provider as CallProvider,
    providerCallSid: row.provider_call_sid,
    direction: row.direction as CallDirection,
    status: row.status as CallStatus,
    fromNumber: row.from_number,
    toNumber: row.to_number,
    contactId: row.contact_id,
    userId: row.user_id,
    startedAt: row.started_at,
    answeredAt: row.answered_at,
    endedAt: row.ended_at,
    durationSeconds: row.duration_seconds,
    createdAt: row.created_at,
  }
}

export function mapTwilioCallStatus(twilioStatus: string): CallStatus {
  return TWILIO_CALL_STATUS[twilioStatus] ?? 'failed'
}
