import type { CallDirection, CallStatus } from '@repo/shared-types'

export const TELEPHONY_EVENTS = {
  CALL_COMPLETED: 'call.completed',
} as const

export interface CallCompletedEvent {
  schemaName: string
  tenantId: string
  callId: string
  userId: string | null
  contactId: string | null
  direction: CallDirection
  status: CallStatus
  toNumber: string
  durationSeconds: number
  startedAt: string
}
