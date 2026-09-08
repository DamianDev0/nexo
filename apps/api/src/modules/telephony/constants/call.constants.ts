import type { CallStatus } from '@repo/shared-types'

export const CALL_COLUMNS = `
  id, provider, provider_call_sid, direction, status,
  from_number, to_number, contact_id, user_id,
  started_at, answered_at, ended_at, duration_seconds, created_at
`

export const CALL_LIST_DEFAULT = 20

export const TERMINAL_CALL_STATUSES: readonly CallStatus[] = [
  'completed',
  'busy',
  'no_answer',
  'failed',
  'canceled',
]

export const TWILIO_CALL_STATUS: Readonly<Record<string, CallStatus>> = {
  queued: 'initiated',
  initiated: 'initiated',
  ringing: 'ringing',
  'in-progress': 'in_progress',
  answered: 'in_progress',
  completed: 'completed',
  busy: 'busy',
  'no-answer': 'no_answer',
  failed: 'failed',
  canceled: 'canceled',
}

export const VOICE_WEBHOOK_PATH = 'telephony/twilio'
