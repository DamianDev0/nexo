import type { Message, MessageChannel, MessageDirection, MessageStatus } from '@repo/shared-types'
import { TWILIO_MESSAGE_STATUS } from '../constants/message.constants'
import type { MessageRow } from '../interfaces/message-row.interfaces'

export function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    channel: row.channel as MessageChannel,
    direction: row.direction as MessageDirection,
    status: row.status as MessageStatus,
    provider: row.provider,
    providerMessageSid: row.provider_message_sid,
    fromNumber: row.from_number,
    toNumber: row.to_number,
    body: row.body,
    segments: row.segments,
    errorCode: row.error_code,
    contactId: row.contact_id,
    userId: row.user_id,
    sentAt: row.sent_at,
    deliveredAt: row.delivered_at,
    createdAt: row.created_at,
  }
}

export function mapTwilioMessageStatus(twilioStatus: string): MessageStatus {
  return TWILIO_MESSAGE_STATUS[twilioStatus] ?? 'failed'
}
