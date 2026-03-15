import { Injectable } from '@nestjs/common'
import type { EmailBrandingContext } from '@repo/shared-types'
import { TenantConfigService } from '@/modules/settings/services/tenant-config.service'
import { ResendService } from './resend.service'
import type {
  InviteEmailParams,
  ResetPasswordEmailParams,
  WelcomeEmailParams,
} from './interfaces/resend.interfaces'

/**
 * Tenant-aware email service.
 * Automatically injects the tenant's branding (companyName, logoUrl, primaryColor)
 * into every transactional email so recipients see the business' identity,
 * not the platform's.
 */
@Injectable()
export class TenantEmailService {
  constructor(
    private readonly resend: ResendService,
    private readonly tenantConfig: TenantConfigService,
  ) {}

  async sendWelcomeEmail(
    to: string,
    params: Omit<WelcomeEmailParams, 'branding'>,
    tenantId: string,
  ): Promise<void> {
    const branding = await this.getBranding(tenantId)
    return this.resend.sendWelcomeEmail(to, { ...params, branding })
  }

  async sendPasswordResetEmail(
    to: string,
    params: Omit<ResetPasswordEmailParams, 'branding'>,
    tenantId: string,
  ): Promise<void> {
    const branding = await this.getBranding(tenantId)
    return this.resend.sendPasswordResetEmail(to, { ...params, branding })
  }

  async sendInviteEmail(
    to: string,
    params: Omit<InviteEmailParams, 'branding'>,
    tenantId: string,
  ): Promise<void> {
    const branding = await this.getBranding(tenantId)
    return this.resend.sendInviteEmail(to, { ...params, branding })
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private async getBranding(tenantId: string): Promise<EmailBrandingContext> {
    const theme = await this.tenantConfig.getTheme(tenantId)
    return {
      companyName: theme.branding.companyName,
      primaryColor: theme.colors.primary,
      logoUrl: theme.branding.logoUrl,
    }
  }
}
