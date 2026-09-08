import type { TwilioSettingsService } from '../twilio-settings.service'
import { TwilioMessagingService } from '../twilio-messaging.service'

describe('TwilioMessagingService', () => {
  const create = jest.fn()
  const settings = {
    settings: { phoneNumber: '+17372212163' },
    client: { messages: { create } },
  } as unknown as TwilioSettingsService

  beforeEach(() => create.mockReset())

  it('sends from the configured number with a status callback and reports segments', async () => {
    create.mockResolvedValue({ sid: 'SM1', status: 'queued', numSegments: '2' })
    const service = new TwilioMessagingService(settings)
    const result = await service.sendSms({
      to: '+573001234567',
      body: 'Hola',
      statusCallbackUrl: 'https://h/status',
    })
    expect(create).toHaveBeenCalledWith({
      from: '+17372212163',
      to: '+573001234567',
      body: 'Hola',
      statusCallback: 'https://h/status',
    })
    expect(result).toEqual({ sid: 'SM1', status: 'queued', segments: 2 })
    expect(service.senderNumber).toBe('+17372212163')
  })

  it('defaults to one segment when Twilio omits the count', async () => {
    create.mockResolvedValue({ sid: 'SM2', status: 'queued', numSegments: '' })
    const service = new TwilioMessagingService(settings)
    await expect(
      service.sendSms({ to: '+57', body: 'x', statusCallbackUrl: 'u' }),
    ).resolves.toMatchObject({ segments: 1 })
  })
})
