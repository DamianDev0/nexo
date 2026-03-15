import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { getLoggerToken } from 'nestjs-pino'

import { OnboardingListener } from '../listeners/onboarding.listener'
import { ResendService } from '@/shared/integrations/resend/resend.service'
import { TenantOnboardedEvent } from '@/shared/events/auth.events'

const mockEvent = new TenantOnboardedEvent('owner@acme.com', 'John Doe', 'Acme Corp', 'tenant_acme')

describe('OnboardingListener', () => {
  let listener: OnboardingListener
  let resend: jest.Mocked<Pick<ResendService, 'sendWelcomeEmail'>>
  let config: jest.Mocked<Pick<ConfigService, 'get'>>
  let logger: { error: jest.Mock; info: jest.Mock }

  beforeEach(async () => {
    resend = { sendWelcomeEmail: jest.fn() }
    config = { get: jest.fn() }
    logger = { error: jest.fn(), info: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        OnboardingListener,
        { provide: getLoggerToken(OnboardingListener.name), useValue: logger },
        { provide: ResendService, useValue: resend },
        { provide: ConfigService, useValue: config },
      ],
    }).compile()

    listener = module.get(OnboardingListener)
  })

  it('sends a welcome email with correct params', async () => {
    config.get.mockReturnValue('https://app.nexocrm.com')
    resend.sendWelcomeEmail.mockResolvedValue(undefined)

    await listener.handleTenantOnboarded(mockEvent)

    expect(resend.sendWelcomeEmail).toHaveBeenCalledWith('owner@acme.com', {
      ownerName: 'John Doe',
      tenantName: 'Acme Corp',
      dashboardUrl: 'https://app.nexocrm.com/dashboard',
    })
  })

  it('uses localhost:3001 as fallback frontend URL', async () => {
    config.get.mockImplementation((_key: string, defaultValue?: string) => defaultValue)
    resend.sendWelcomeEmail.mockResolvedValue(undefined)

    await listener.handleTenantOnboarded(mockEvent)

    expect(resend.sendWelcomeEmail).toHaveBeenCalledWith(
      'owner@acme.com',
      expect.objectContaining({ dashboardUrl: 'http://localhost:3001/dashboard' }),
    )
  })

  it('logs error and does not rethrow when email sending fails', async () => {
    config.get.mockReturnValue('http://localhost:3001')
    resend.sendWelcomeEmail.mockRejectedValue(new Error('SMTP timeout'))

    await expect(listener.handleTenantOnboarded(mockEvent)).resolves.toBeUndefined()
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'owner@acme.com', error: 'SMTP timeout' }),
      'Welcome email failed',
    )
  })

  it('logs error as string when non-Error is thrown', async () => {
    config.get.mockReturnValue('http://localhost:3001')
    resend.sendWelcomeEmail.mockRejectedValue('plain string error')

    await listener.handleTenantOnboarded(mockEvent)

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'plain string error' }),
      'Welcome email failed',
    )
  })
})
