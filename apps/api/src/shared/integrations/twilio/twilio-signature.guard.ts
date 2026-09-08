import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import type { Request } from 'express'
import twilio from 'twilio'
import { TWILIO_SIGNATURE_HEADER } from './twilio.constants'
import { TwilioSettingsService } from './twilio-settings.service'

@Injectable()
export class TwilioSignatureGuard implements CanActivate {
  constructor(private readonly twilio: TwilioSettingsService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>()
    const signature = req.headers[TWILIO_SIGNATURE_HEADER]
    if (typeof signature !== 'string' || signature === '') {
      throw new ForbiddenException('Missing Twilio signature')
    }

    const url = `${this.twilio.settings.webhookBaseUrl}${req.originalUrl}`
    const params = (req.body ?? {}) as Record<string, string>
    if (!twilio.validateRequest(this.twilio.settings.authToken, signature, url, params)) {
      throw new ForbiddenException('Invalid Twilio signature')
    }
    return true
  }
}
