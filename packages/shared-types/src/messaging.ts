export type MessageChannel = 'sms' | 'whatsapp' | 'email'

export type MessageDirection = 'outbound' | 'inbound'

export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'undelivered' | 'failed'

export type Message = {
  id: string
  channel: MessageChannel
  direction: MessageDirection
  status: MessageStatus
  provider: string
  providerMessageSid: string | null
  fromNumber: string
  toNumber: string
  body: string
  segments: number
  errorCode: string | null
  contactId: string | null
  userId: string | null
  sentAt: string | null
  deliveredAt: string | null
  createdAt: string
}

export type SendMessageInput = {
  channel: MessageChannel
  to: string
  body: string
  contactId?: string
}
