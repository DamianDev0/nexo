import { Test } from '@nestjs/testing'
import { CommunicationListener } from '../listeners/communication.listener'
import { ActivitiesService } from '../services/activities.service'
import { buildCallActivity, buildMessageActivity } from '../mappers/communication-activity.mapper'
import type { CallCompletedEvent } from '@/shared/events/telephony.events'
import type { MessageSentEvent } from '@/shared/events/messaging.events'

const CALL: CallCompletedEvent = {
  schemaName: 'tenant_acme',
  tenantId: 'ten-1',
  callId: 'call-1',
  userId: 'usr-1',
  contactId: 'cnt-1',
  direction: 'outbound',
  status: 'completed',
  toNumber: '+573001234567',
  durationSeconds: 272,
  startedAt: '2026-09-07T10:00:00Z',
}

const SMS: MessageSentEvent = {
  schemaName: 'tenant_acme',
  tenantId: 'ten-1',
  messageId: 'msg-1',
  channel: 'sms',
  userId: 'usr-1',
  contactId: 'cnt-1',
  toNumber: '+573001234567',
  body: 'Hola Juan',
  sentAt: '2026-09-08T10:00:01Z',
}

describe('CommunicationListener', () => {
  let listener: CommunicationListener
  const activities = { create: jest.fn() }

  beforeEach(async () => {
    activities.create.mockReset().mockResolvedValue({ id: 'act-1' })
    const module = await Test.createTestingModule({
      providers: [CommunicationListener, { provide: ActivitiesService, useValue: activities }],
    }).compile()
    listener = module.get(CommunicationListener)
  })

  it('logs a completed call as a completed activity', async () => {
    await listener.onCallCompleted(CALL)
    expect(activities.create).toHaveBeenCalledWith(
      'tenant_acme',
      buildCallActivity(CALL),
      'usr-1',
      true,
    )
  })

  it('logs a sent sms as a completed activity', async () => {
    await listener.onMessageSent(SMS)
    expect(activities.create).toHaveBeenCalledWith(
      'tenant_acme',
      buildMessageActivity(SMS),
      'usr-1',
      true,
    )
  })

  it('skips events without an owning user', async () => {
    await listener.onCallCompleted({ ...CALL, userId: null })
    await listener.onMessageSent({ ...SMS, userId: null })
    expect(activities.create).not.toHaveBeenCalled()
  })

  it('builds call and sms activities with outcome labels', () => {
    expect(buildCallActivity(CALL)).toEqual({
      activityType: 'call',
      title: 'Llamada realizada',
      description: 'Saliente · +573001234567',
      dueDate: '2026-09-07T10:00:00Z',
      durationMinutes: 5,
      contactId: 'cnt-1',
    })
    expect(
      buildCallActivity({ ...CALL, status: 'no_answer', durationSeconds: 0, contactId: null }),
    ).toMatchObject({
      title: 'Llamada sin respuesta',
      durationMinutes: 0,
      contactId: undefined,
    })
    expect(buildMessageActivity(SMS)).toEqual({
      activityType: 'sms',
      title: 'SMS enviado',
      description: 'Hola Juan',
      dueDate: '2026-09-08T10:00:01Z',
      contactId: 'cnt-1',
    })
  })
})
