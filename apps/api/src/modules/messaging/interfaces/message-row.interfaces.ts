import type { MessageStatus } from '@repo/shared-types'

export interface MessageRow {
  id: string
  channel: string
  direction: string
  status: string
  provider: string
  provider_message_sid: string | null
  from_number: string
  to_number: string
  body: string
  segments: number
  error_code: string | null
  contact_id: string | null
  user_id: string | null
  sent_at: string | null
  delivered_at: string | null
  created_at: string
}

export interface MessageInsertValues {
  fromNumber: string
  toNumber: string
  body: string
  contactId: string | null
  userId: string
}

export interface MessageSentValues {
  messageId: string
  providerMessageSid: string
  segments: number
}

export interface MessageStatusUpdate {
  providerMessageSid: string
  status: MessageStatus
  errorCode: string | null
}

export interface MessageListFilters {
  contactId?: string
  limit: number
}

export interface MessageStatusCallback {
  messageSid: string
  twilioStatus: string
  errorCode: string | null
}
