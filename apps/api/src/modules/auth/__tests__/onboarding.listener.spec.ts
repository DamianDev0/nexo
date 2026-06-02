import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { getLoggerToken } from 'nestjs-pino'

import { OnboardingListener } from '../listeners/onboarding.listener'
import { TenantEmailService } from '@/shared/integrations/resend/tenant-email.service'
import { TenantOnboardedEvent } from '@/shared/events/auth.events'

const mockEvent = new TenantOnboardedEvent(
  'owner@acme.com',
  'John Doe',
  'Acme Corp',
  'tenant_acme',
  'tenant-uuid-1',
)

describe('OnboardingListener', () => {
  let listener: OnboardingListener
  let tenantEmail: jest.Mocked<Pick<TenantEmailService, 'sendWelcomeEmail'>>
  let config: jest.Mocked<Pick<ConfigService, 'get'>>
  let logger: { error: jest.Mock; info: jest.Mock }

  beforeEach(async () => {
    tenantEmail = { sendWelcomeEmail: jest.fn() }
    config = { get: jest.fn() }
    logger = { error: jest.fn(), info: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        OnboardingListener,
        { provide: getLoggerToken(OnboardingListener.name), useValue: logger },
        { provide: TenantEmailService, useValue: tenantEmail },
        { provide: ConfigService, useValue: config },
      ],
    }).compile()

    listener = module.get(OnboardingListener)
  })

  it('sends a welcome email with correct params', async () => {
    config.get.mockReturnValue('https://app.nexocrm.com')
    tenantEmail.sendWelcomeEmail.mockResolvedValue(undefined)

    await listener.handleTenantOnboarded(mockEvent)

    expect(tenantEmail.sendWelcomeEmail).toHaveBeenCalledWith(
      'owner@acme.com',
      {
        ownerName: 'John Doe',
        tenantName: 'Acme Corp',
        dashboardUrl: 'https://app.nexocrm.com/dashboard',
      },
      'tenant-uuid-1',
    )
  })

  it('uses localhost:3001 as fallback frontend URL', async () => {
    config.get.mockImplementation((_key: unknown, defaultValue?: unknown) => defaultValue)
    tenantEmail.sendWelcomeEmail.mockResolvedValue(undefined)

    await listener.handleTenantOnboarded(mockEvent)

    expect(tenantEmail.sendWelcomeEmail).toHaveBeenCalledWith(
      'owner@acme.com',
      expect.objectContaining({ dashboardUrl: 'http://localhost:3001/dashboard' }),
      'tenant-uuid-1',
    )
  })

  it('logs error and does not rethrow when email sending fails', async () => {
    config.get.mockReturnValue('http://localhost:3001')
    tenantEmail.sendWelcomeEmail.mockRejectedValue(new Error('SMTP timeout'))

    await expect(listener.handleTenantOnboarded(mockEvent)).resolves.toBeUndefined()
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'owner@acme.com', error: 'SMTP timeout' }),
      'Welcome email failed',
    )
  })

  it('logs error as string when non-Error is thrown', async () => {
    config.get.mockReturnValue('http://localhost:3001')
    tenantEmail.sendWelcomeEmail.mockRejectedValue('plain string error')

    await listener.handleTenantOnboarded(mockEvent)

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'plain string error' }),
      'Welcome email failed',
    )
  })
})
