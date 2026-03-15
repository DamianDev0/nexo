import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { TenantEmailService } from '@/shared/integrations/resend/tenant-email.service'
import { AUTH_EVENTS, TenantOnboardedEvent } from '@/shared/events/auth.events'

@Injectable()
export class OnboardingListener {
  constructor(
    @InjectPinoLogger(OnboardingListener.name)
    private readonly logger: PinoLogger,
    private readonly tenantEmail: TenantEmailService,
    private readonly config: ConfigService,
  ) {}

  @OnEvent(AUTH_EVENTS.TENANT_ONBOARDED)
  async handleTenantOnboarded(event: TenantOnboardedEvent): Promise<void> {
    const frontendUrl = this.config.get<string>('app.frontendUrl', 'http://localhost:3001')

    try {
      await this.tenantEmail.sendWelcomeEmail(
        event.ownerEmail,
        {
          ownerName: event.ownerName,
          tenantName: event.tenantName,
          dashboardUrl: `${frontendUrl}/dashboard`,
        },
        event.tenantId,
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.error({ email: event.ownerEmail, error: message }, 'Welcome email failed')
    }
  }
}
