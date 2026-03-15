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
}

export interface ResetPasswordEmailParams {
  resetUrl: string
  userEmail: string
  expiresInMinutes: number
}

export interface WelcomeEmailParams {
  ownerName: string
  tenantName: string
  dashboardUrl: string
}
