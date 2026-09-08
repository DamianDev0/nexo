import { getQueueToken } from '@nestjs/bullmq'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { getLoggerToken } from 'nestjs-pino'
import { ContactPhoneLookupRepository } from '@/shared/database/repositories/contact-phone-lookup.repository'
import { TenantSchemaRepository } from '@/shared/database/repositories/tenant-schema.repository'
import { EventBusService } from '@/shared/events/event-bus.service'
import { MESSAGING_EVENTS } from '@/shared/events/messaging.events'
import { TwilioMessagingService } from '@/shared/integrations/twilio/twilio-messaging.service'
import { TwilioSettingsService } from '@/shared/integrations/twilio/twilio-settings.service'
import { QUEUE_NAMES } from '@/shared/queue/queue-names'
import { MessagingService } from '../services/messaging.service'
import { MessagesRepository } from '../repositories/messages.repository'
import type { MessageRow } from '../interfaces/message-row.interfaces'

const SCHEMA = 'tenant_acme'
const TENANT_ID = '0b3f2a1c-4d5e-4f60-8a71-92b3c4d5e6f7'
const USER = {
  id: 'usr-1',
  email: 'a@b.co',
  role: 'sales_rep' as never,
  tenantId: TENANT_ID,
  schemaName: SCHEMA,
}
const JOB = { schemaName: SCHEMA, tenantId: TENANT_ID, messageId: 'msg-1' }

function makeRow(overrides: Partial<MessageRow> = {}): MessageRow {
  return {
    id: 'msg-1',
    channel: 'sms',
    direction: 'outbound',
    status: 'queued',
    provider: 'twilio',
    provider_message_sid: null,
    from_number: '+17372212163',
    to_number: '+573001234567',
    body: 'Hola',
    segments: 1,
    error_code: null,
    contact_id: 'cnt-1',
    user_id: 'usr-1',
    sent_at: null,
    delivered_at: null,
    created_at: '2026-09-08T10:00:00Z',
    ...overrides,
  }
}

describe('MessagingService', () => {
  let service: MessagingService
  let messages: Record<
    'insertQueued' | 'markSent' | 'markFailed' | 'applyProviderStatus' | 'findById' | 'findRecent',
    jest.Mock
  >
  let contacts: { findContactIdByPhone: jest.Mock }
  let tenants: { findSchemaName: jest.Mock }
  let twilio: { senderNumber: string; sendSms: jest.Mock }
  let queue: { add: jest.Mock }
  let eventBus: { emit: jest.Mock }

  beforeEach(async () => {
    messages = {
      insertQueued: jest.fn().mockResolvedValue(makeRow()),
      markSent: jest
        .fn()
        .mockResolvedValue(
          makeRow({ status: 'sent', provider_message_sid: 'SM1', sent_at: '2026-09-08T10:00:01Z' }),
        ),
      markFailed: jest.fn().mockResolvedValue(undefined),
      applyProviderStatus: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(makeRow()),
      findRecent: jest.fn().mockResolvedValue([makeRow()]),
    }
    contacts = { findContactIdByPhone: jest.fn().mockResolvedValue('cnt-9') }
    tenants = { findSchemaName: jest.fn().mockResolvedValue(SCHEMA) }
    twilio = {
      senderNumber: '+17372212163',
      sendSms: jest.fn().mockResolvedValue({ sid: 'SM1', status: 'queued', segments: 1 }),
    }
    queue = { add: jest.fn().mockResolvedValue(undefined) }
    eventBus = { emit: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        MessagingService,
        {
          provide: getLoggerToken(MessagingService.name),
          useValue: { info: jest.fn(), error: jest.fn() },
        },
        { provide: getQueueToken(QUEUE_NAMES.SMS), useValue: queue },
        { provide: MessagesRepository, useValue: messages },
        { provide: ContactPhoneLookupRepository, useValue: contacts },
        { provide: TenantSchemaRepository, useValue: tenants },
        { provide: TwilioMessagingService, useValue: twilio },
        {
          provide: TwilioSettingsService,
          useValue: {
            webhookUrl: (path: string, tenantId: string) =>
              `https://hooks.example.com/api/v1/${path}?tenant=${tenantId}`,
          },
        },
        { provide: EventBusService, useValue: eventBus },
      ],
    }).compile()
    service = module.get(MessagingService)
  })

  describe('send', () => {
    it('normalizes the destination, links the contact by phone and queues the job', async () => {
      const result = await service.send(SCHEMA, USER, {
        channel: 'sms',
        to: '300 123 4567',
        body: 'Hola',
      })
      expect(contacts.findContactIdByPhone).toHaveBeenCalledWith(SCHEMA, '3001234567')
      expect(messages.insertQueued).toHaveBeenCalledWith(SCHEMA, {
        fromNumber: '+17372212163',
        toNumber: '+573001234567',
        body: 'Hola',
        contactId: 'cnt-9',
        userId: 'usr-1',
      })
      expect(queue.add).toHaveBeenCalledWith('send-sms', JOB)
      expect(result.status).toBe('queued')
    })

    it('keeps an explicit contact id without looking it up', async () => {
      await service.send(SCHEMA, USER, {
        channel: 'sms',
        to: '+12025550123',
        body: 'Hi',
        contactId: 'cnt-1',
      })
      expect(contacts.findContactIdByPhone).not.toHaveBeenCalled()
      expect(messages.insertQueued).toHaveBeenCalledWith(
        SCHEMA,
        expect.objectContaining({ toNumber: '+12025550123', contactId: 'cnt-1' }),
      )
    })

    it('rejects an invalid destination before persisting', async () => {
      await expect(
        service.send(SCHEMA, USER, { channel: 'sms', to: '12345', body: 'x' }),
      ).rejects.toThrow(BadRequestException)
      expect(messages.insertQueued).not.toHaveBeenCalled()
    })
  })

  describe('deliver', () => {
    it('sends through Twilio with a tenant-scoped status callback, marks sent and emits once', async () => {
      await service.deliver(JOB)
      expect(twilio.sendSms).toHaveBeenCalledWith({
        to: '+573001234567',
        body: 'Hola',
        statusCallbackUrl: `https://hooks.example.com/api/v1/messaging/twilio/status?tenant=${TENANT_ID}`,
      })
      expect(messages.markSent).toHaveBeenCalledWith(SCHEMA, {
        messageId: 'msg-1',
        providerMessageSid: 'SM1',
        segments: 1,
      })
      expect(eventBus.emit).toHaveBeenCalledWith(
        MESSAGING_EVENTS.MESSAGE_SENT,
        expect.objectContaining({
          schemaName: SCHEMA,
          tenantId: TENANT_ID,
          messageId: 'msg-1',
          contactId: 'cnt-1',
          body: 'Hola',
        }),
      )
    })

    it('skips messages that are no longer queued', async () => {
      messages.findById.mockResolvedValueOnce(makeRow({ status: 'sent' }))
      await service.deliver(JOB)
      expect(twilio.sendSms).not.toHaveBeenCalled()
    })

    it('marks the message failed with the Twilio error code and rethrows for retry', async () => {
      twilio.sendSms.mockRejectedValueOnce({ code: 21211, message: 'Invalid To' })
      await expect(service.deliver(JOB)).rejects.toMatchObject({ code: 21211 })
      expect(messages.markFailed).toHaveBeenCalledWith(SCHEMA, 'msg-1', '21211')
      expect(eventBus.emit).not.toHaveBeenCalled()
    })
  })

  describe('handleStatusCallback', () => {
    it('resolves the tenant schema and applies the mapped status', async () => {
      await service.handleStatusCallback(
        { messageSid: 'SM1', twilioStatus: 'delivered', errorCode: null },
        TENANT_ID,
      )
      expect(tenants.findSchemaName).toHaveBeenCalledWith(TENANT_ID)
      expect(messages.applyProviderStatus).toHaveBeenCalledWith(SCHEMA, {
        providerMessageSid: 'SM1',
        status: 'delivered',
        errorCode: null,
      })
    })

    it('rejects unknown tenants', async () => {
      tenants.findSchemaName.mockResolvedValueOnce(null)
      await expect(
        service.handleStatusCallback(
          { messageSid: 'SM1', twilioStatus: 'sent', errorCode: null },
          TENANT_ID,
        ),
      ).rejects.toThrow(NotFoundException)
    })
  })

  it('finds one or throws 404', async () => {
    await expect(service.findOne(SCHEMA, 'msg-1')).resolves.toMatchObject({ id: 'msg-1' })
    messages.findById.mockResolvedValueOnce(null)
    await expect(service.findOne(SCHEMA, 'nope')).rejects.toThrow(NotFoundException)
  })
})
