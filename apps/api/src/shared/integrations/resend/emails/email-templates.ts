import { compileTemplate } from '../template.engine'
import type {
  InviteEmailParams,
  ResetPasswordEmailParams,
  WelcomeEmailParams,
} from '../interfaces/resend.interfaces'

export function buildWelcomeEmail(params: WelcomeEmailParams): { subject: string; html: string } {
  const subject = `Welcome to NexoCRM, ${params.ownerName}!`
  const html = compileTemplate('welcome', {
    subject,
    ownerName: params.ownerName,
    tenantName: params.tenantName,
    dashboardUrl: params.dashboardUrl,
  })
  return { subject, html }
}

export function buildInviteEmail(params: InviteEmailParams): { subject: string; html: string } {
  const subject = `You've been invited to join ${params.tenantName} on NexoCRM`
  const unit = params.expiresInHours === 1 ? 'hour' : 'hours'
  const html = compileTemplate('invite', {
    subject,
    inviteUrl: params.inviteUrl,
    tenantName: params.tenantName,
    inviterName: params.inviterName,
    role: params.role,
    noteText: `This link expires in ${params.expiresInHours} ${unit}. If you weren't expecting this invite, you can safely ignore this email.`,
  })
  return { subject, html }
}

export function buildResetPasswordEmail(params: ResetPasswordEmailParams): {
  subject: string
  html: string
} {
  const subject = 'Reset your NexoCRM password'
  const unit = params.expiresInMinutes === 1 ? 'minute' : 'minutes'
  const html = compileTemplate('reset-password', {
    subject,
    resetUrl: params.resetUrl,
    userEmail: params.userEmail,
    noteText: `This link expires in ${params.expiresInMinutes} ${unit}. If you didn't request a password reset, you can safely ignore this email — your password won't change.`,
  })
  return { subject, html }
}
