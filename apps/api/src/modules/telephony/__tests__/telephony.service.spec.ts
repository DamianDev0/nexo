import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { getLoggerToken } from 'nestjs-pino'
import { ContactPhoneLookupRepository } from '@/shared/database/repositories/contact-phone-lookup.repository'
import { EventBusService } from '@/shared/events/event-bus.service'
import { TELEPHONY_EVENTS } from '@/shared/events/telephony.events'
import { TwilioSettingsService } from '@/shared/integrations/twilio/twilio-settings.service'
import { TwilioVoiceService } from '@/shared/integrations/twilio/twilio-voice.service'
import { TelephonyService } from '../services/telephony.service'
import { CallsRepository } from '../repositories/calls.repository'
import { TenantSchemaRepository } from '@/shared/database/repositories/tenant-schema.repository'
import { encodeVoiceIdentity } from '../mappers/voice-identity.mapper'
import type { CallRow } from '../interfaces/call-row.interfaces'

const TENANT_ID = '0b3f2a1c-4d5e-4f60-8a71-92b3c4d5e6f7'
const USER_ID = 'f7e6d5c4-b3a2-4918-8776-655443322110'
const SCHEMA = 'tenant_acme'
const IDENTITY = encodeVoiceIdentity(TENANT_ID, USER_ID)
const BASE_URL = 'https://hooks.example.com'

function makeRow(overrides: Partial<CallRow> = {}): CallRow {
  return {
    id: 'call-1',
    provider: 'twilio',
    provider_call_sid: 'CA1',
    direction: 'outbound',
    status: 'completed',
    from_number: '+17372212163',
    to_number: '+573001234567',
    contact_id: 'cnt-1',
    user_id: USER_ID,
    started_at: '2026-09-07T10:00:00Z',
    answered_at: '2026-09-07T10:00:05Z',
    ended_at: '2026-09-07T10:04:37Z',
    duration_seconds: 272,
    created_at: '2026-09-07T10:00:00Z',
    ...overrides,
  }
}

describe('TelephonyService', () => {
  let service: TelephonyService
  let calls: jest.Mocked<Pick<CallsRepository, 'insertOutbound' | 'applyProgress' | 'finalize'>>
  let contacts: { findContactIdByPhone: jest.Mock }
  let tenants: { findSchemaName: jest.Mock }
  let twilio: {
    callerId: string
    createAccessToken: jest.Mock
    outboundDialTwiml: jest.Mock
    hangupTwiml: jest.Mock
    emptyTwiml: jest.Mock
  }
  let eventBus: { emit: jest.Mock }

  beforeEach(async () => {
    calls = {
      insertOutbound: jest.fn().mockResolvedValue(makeRow({ status: 'initiated' })),
      applyProgress: jest.fn().mockResolvedValue(undefined),
      finalize: jest.fn().mockResolvedValue(makeRow()),
    }
    contacts = { findContactIdByPhone: jest.fn().mockResolvedValue('cnt-1') }
    tenants = { findSchemaName: jest.fn().mockResolvedValue(SCHEMA) }
    twilio = {
      callerId: '+17372212163',
      createAccessToken: jest
        .fn()
        .mockReturnValue({ token: 'jwt', expiresAt: new Date('2026-09-07T11:00:00Z') }),
      outboundDialTwiml: jest.fn().mockReturnValue('<Response><Dial/></Response>'),
      hangupTwiml: jest.fn().mockReturnValue('<Response><Hangup/></Response>'),
      emptyTwiml: jest.fn().mockReturnValue('<Response/>'),
    }
    eventBus = { emit: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        TelephonyService,
        {
          provide: getLoggerToken(TelephonyService.name),
          useValue: { info: jest.fn(), warn: jest.fn() },
        },
        { provide: TwilioVoiceService, useValue: twilio },
        {
          provide: TwilioSettingsService,
          useValue: {
            webhookUrl: (path: string, tenantId: string) =>
              `${BASE_URL}/api/v1/${path}?tenant=${tenantId}`,
          },
        },
        { provide: CallsRepository, useValue: calls },
        { provide: TenantSchemaRepository, useValue: tenants },
        { provide: ContactPhoneLookupRepository, useValue: contacts },
        { provide: EventBusService, useValue: eventBus },
      ],
    }).compile()

    service = module.get(TelephonyService)
  })

  describe('issueVoiceToken', () => {
    it('binds the token identity to tenant and user', () => {
      const result = service.issueVoiceToken({
        id: USER_ID,
        email: 'a@b.co',
        role: 'sales_rep' as never,
        tenantId: TENANT_ID,
        schemaName: SCHEMA,
      })
      expect(twilio.createAccessToken).toHaveBeenCalledWith(IDENTITY)
      expect(result).toEqual({
        token: 'jwt',
        identity: IDENTITY,
        expiresAt: '2026-09-07T11:00:00.000Z',
      })
    })
  })

  describe('handleOutboundVoice', () => {
    it('normalizes a Colombian national number, links the contact and returns dial TwiML', async () => {
      const twiml = await service.handleOutboundVoice({
        callSid: 'CA1',
        identity: IDENTITY,
        to: '300 123 4567',
      })

      expect(tenants.findSchemaName).toHaveBeenCalledWith(TENANT_ID)
      expect(contacts.findContactIdByPhone).toHaveBeenCalledWith(SCHEMA, '3001234567')
      expect(calls.insertOutbound).toHaveBeenCalledWith(SCHEMA, {
        providerCallSid: 'CA1',
        fromNumber: '+17372212163',
        toNumber: '+573001234567',
        contactId: 'cnt-1',
        userId: USER_ID,
      })
      expect(twilio.outboundDialTwiml).toHaveBeenCalledWith({
        to: '+573001234567',
        statusCallbackUrl: `${BASE_URL}/api/v1/telephony/twilio/status?tenant=${TENANT_ID}`,
        actionUrl: `${BASE_URL}/api/v1/telephony/twilio/dial-action?tenant=${TENANT_ID}`,
      })
      expect(twiml).toBe('<Response><Dial/></Response>')
    })

    it('keeps an already E.164 destination untouched', async () => {
      await service.handleOutboundVoice({ callSid: 'CA1', identity: IDENTITY, to: '+12025550123' })
      expect(calls.insertOutbound).toHaveBeenCalledWith(
        SCHEMA,
        expect.objectContaining({ toNumber: '+12025550123' }),
      )
    })

    it('hangs up on an invalid destination without persisting anything', async () => {
      const twiml = await service.handleOutboundVoice({
        callSid: 'CA1',
        identity: IDENTITY,
        to: '12345',
      })
      expect(twiml).toBe('<Response><Hangup/></Response>')
      expect(calls.insertOutbound).not.toHaveBeenCalled()
    })

    it('rejects unknown identities and unknown tenants', async () => {
      await expect(
        service.handleOutboundVoice({ callSid: 'CA1', identity: 'bogus', to: '3001234567' }),
      ).rejects.toThrow(NotFoundException)

      tenants.findSchemaName.mockResolvedValueOnce(null)
      await expect(
        service.handleOutboundVoice({ callSid: 'CA1', identity: IDENTITY, to: '3001234567' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('handleStatusCallback', () => {
    it('applies child-leg progress keyed by the parent call sid', async () => {
      await service.handleStatusCallback(
        {
          callSid: 'CA2',
          parentCallSid: 'CA1',
          identity: null,
          twilioStatus: 'in-progress',
          durationSeconds: 0,
          sequence: 2,
        },
        TENANT_ID,
      )
      expect(calls.applyProgress).toHaveBeenCalledWith(SCHEMA, {
        providerCallSid: 'CA1',
        status: 'in_progress',
        sequence: 2,
      })
      expect(calls.finalize).not.toHaveBeenCalled()
    })

    it('finalizes on parent-leg completion resolving the tenant from the client identity', async () => {
      await service.handleStatusCallback(
        {
          callSid: 'CA1',
          parentCallSid: null,
          identity: IDENTITY,
          twilioStatus: 'completed',
          durationSeconds: 300,
          sequence: null,
        },
        undefined,
      )
      expect(calls.finalize).toHaveBeenCalledWith(SCHEMA, {
        providerCallSid: 'CA1',
        status: 'completed',
        durationSeconds: 300,
      })
      expect(eventBus.emit).toHaveBeenCalledWith(
        TELEPHONY_EVENTS.CALL_COMPLETED,
        expect.objectContaining({
          schemaName: SCHEMA,
          tenantId: TENANT_ID,
          callId: 'call-1',
          contactId: 'cnt-1',
          userId: USER_ID,
          durationSeconds: 272,
        }),
      )
    })

    it('does not emit twice when the call was already finalized', async () => {
      calls.finalize.mockResolvedValueOnce(null)
      await service.handleStatusCallback(
        {
          callSid: 'CA1',
          parentCallSid: null,
          identity: IDENTITY,
          twilioStatus: 'completed',
          durationSeconds: 300,
          sequence: null,
        },
        undefined,
      )
      expect(eventBus.emit).not.toHaveBeenCalled()
    })
  })

  describe('handleDialAction', () => {
    it('finalizes with the dial outcome and answers empty TwiML', async () => {
      const twiml = await service.handleDialAction(
        { callSid: 'CA1', twilioStatus: 'no-answer', durationSeconds: 0 },
        TENANT_ID,
      )
      expect(calls.finalize).toHaveBeenCalledWith(SCHEMA, {
        providerCallSid: 'CA1',
        status: 'no_answer',
        durationSeconds: 0,
      })
      expect(eventBus.emit).toHaveBeenCalledTimes(1)
      expect(twiml).toBe('<Response/>')
    })
  })
})
