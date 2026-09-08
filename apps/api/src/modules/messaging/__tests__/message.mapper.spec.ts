import { mapMessage, mapTwilioMessageStatus } from '../mappers/message.mapper'
import { parseMessageStatusCallback } from '../mappers/twilio-message-webhook.mapper'
import type { MessageRow } from '../interfaces/message-row.interfaces'
import { BadRequestException } from '@nestjs/common'

const ROW: MessageRow = {
  id: 'msg-1',
  channel: 'sms',
  direction: 'outbound',
  status: 'sent',
  provider: 'twilio',
  provider_message_sid: 'SM1',
  from_number: '+17372212163',
  to_number: '+573001234567',
  body: 'Hola',
  segments: 1,
  error_code: null,
  contact_id: 'cnt-1',
  user_id: 'usr-1',
  sent_at: '2026-09-08T10:00:01Z',
  delivered_at: null,
  created_at: '2026-09-08T10:00:00Z',
}

describe('message mappers', () => {
  it('maps a row to the shared Message shape', () => {
    expect(mapMessage(ROW)).toEqual({
      id: 'msg-1',
      channel: 'sms',
      direction: 'outbound',
      status: 'sent',
      provider: 'twilio',
      providerMessageSid: 'SM1',
      fromNumber: '+17372212163',
      toNumber: '+573001234567',
      body: 'Hola',
      segments: 1,
      errorCode: null,
      contactId: 'cnt-1',
      userId: 'usr-1',
      sentAt: '2026-09-08T10:00:01Z',
      deliveredAt: null,
      createdAt: '2026-09-08T10:00:00Z',
    })
  })

  it.each([
    ['accepted', 'queued'],
    ['sending', 'queued'],
    ['sent', 'sent'],
    ['delivered', 'delivered'],
    ['read', 'delivered'],
    ['undelivered', 'undelivered'],
    ['failed', 'failed'],
    ['weird', 'failed'],
  ])('maps Twilio message status %s → %s', (twilio, expected) => {
    expect(mapTwilioMessageStatus(twilio)).toBe(expected)
  })

  it('parses a status callback with an optional error code', () => {
    expect(
      parseMessageStatusCallback({
        MessageSid: 'SM1',
        MessageStatus: 'undelivered',
        ErrorCode: '30003',
      }),
    ).toEqual({
      messageSid: 'SM1',
      twilioStatus: 'undelivered',
      errorCode: '30003',
    })
    expect(
      parseMessageStatusCallback({ MessageSid: 'SM1', MessageStatus: 'delivered', ErrorCode: '' })
        .errorCode,
    ).toBeNull()
    expect(() => parseMessageStatusCallback({ MessageStatus: 'sent' })).toThrow(BadRequestException)
  })
})
