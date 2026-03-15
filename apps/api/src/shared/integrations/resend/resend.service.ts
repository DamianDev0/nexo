import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { Resend } from 'resend'
import {
  buildInviteEmail,
  buildResetPasswordEmail,
  buildWelcomeEmail,
} from './emails/email-templates'
import type {
  SendEmailOptions,
  InviteEmailParams,
  ResetPasswordEmailParams,
  WelcomeEmailParams,
} from './interfaces/resend.interfaces'

@Injectable()
export class ResendService {
  private readonly client: Resend
  private readonly from: string

  constructor(
    @InjectPinoLogger(ResendService.name)
    private readonly logger: PinoLogger,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.getOrThrow<string>('app.resendApiKey')
    this.from = this.config.getOrThrow<string>('app.emailFrom')
    this.client = new Resend(apiKey)
  }

  // ─── Typed email methods ──────────────────────────────────────────────────

  async sendInviteEmail(to: string, params: InviteEmailParams): Promise<void> {
    const { subject, html } = buildInviteEmail(params)
    await this.send({ to, subject, html })
  }

  async sendPasswordResetEmail(to: string, params: ResetPasswordEmailParams): Promise<void> {
    const { subject, html } = buildResetPasswordEmail(params)
    await this.send({ to, subject, html })
  }

  async sendWelcomeEmail(to: string, params: WelcomeEmailParams): Promise<void> {
    const { subject, html } = buildWelcomeEmail(params)
    await this.send({ to, subject, html })
  }

  // ─── Low-level send ───────────────────────────────────────────────────────

  private async send(options: SendEmailOptions): Promise<void> {
    const { data, error } = await this.client.emails.send({
      from: this.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    if (error) {
      const reason = `${error.name}: ${error.message}`
      this.logger.error({ to: options.to, subject: options.subject, reason }, 'Email send failed')
      throw new InternalServerErrorException(`Failed to send email — ${reason}`)
    }

    this.logger.info({ to: options.to, subject: options.subject, id: data?.id }, 'Email sent')
  }
}
