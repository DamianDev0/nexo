import type { MessageStatus } from '@repo/shared-types'

export const MESSAGE_COLUMNS = `
  id, channel, direction, status, provider, provider_message_sid,
  from_number, to_number, body, segments, error_code,
  contact_id, user_id, sent_at, delivered_at, created_at
`

export const MESSAGE_LIST_DEFAULT = 20

export const MESSAGING_WEBHOOK_PATH = 'messaging/twilio'

export const TWILIO_MESSAGE_STATUS: Readonly<Record<string, MessageStatus>> = {
  queued: 'queued',
  accepted: 'queued',
  scheduled: 'queued',
  sending: 'queued',
  sent: 'sent',
  delivered: 'delivered',
  read: 'delivered',
  undelivered: 'undelivered',
  failed: 'failed',
  canceled: 'failed',
}

export const MESSAGE_STATUS_RANK: Readonly<Record<MessageStatus, number>> = {
  queued: 0,
  sent: 1,
  delivered: 2,
  undelivered: 2,
  failed: 2,
}

export const MESSAGE_STATUS_RANK_SQL = `CASE status ${Object.entries(MESSAGE_STATUS_RANK)
  .map(([status, rank]) => `WHEN '${status}' THEN ${rank}`)
  .join(' ')} ELSE 0 END`
