import type { EmailBrandingContext } from '@repo/shared-types'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export interface InviteEmailParams {
  inviteUrl: string
  tenantName: string
  inviterName: string
  role: string
  expiresInHours: number
  branding?: EmailBrandingContext
}

export interface ResetPasswordEmailParams {
  resetUrl: string
  userEmail: string
  expiresInMinutes: number
  branding?: EmailBrandingContext
}

export interface WelcomeEmailParams {
  ownerName: string
  tenantName: string
  dashboardUrl: string
  branding?: EmailBrandingContext
}
