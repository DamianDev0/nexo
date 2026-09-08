import type { MessageChannel } from '@repo/shared-types'

export const MESSAGING_EVENTS = {
  MESSAGE_SENT: 'message.sent',
} as const

export interface MessageSentEvent {
  schemaName: string
  tenantId: string
  messageId: string
  channel: MessageChannel
  userId: string | null
  contactId: string | null
  toNumber: string
  body: string
  sentAt: string
}
