import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import twilio from 'twilio'
import type { TwilioSettings } from './interfaces/twilio.interfaces'

@Injectable()
export class TwilioSettingsService {
  readonly settings: TwilioSettings
  readonly client: twilio.Twilio
  private readonly apiPrefix: string

  constructor(config: ConfigService) {
    this.settings = {
      accountSid: config.getOrThrow<string>('twilio.accountSid'),
      authToken: config.getOrThrow<string>('twilio.authToken'),
      apiKeySid: config.getOrThrow<string>('twilio.apiKeySid'),
      apiKeySecret: config.getOrThrow<string>('twilio.apiKeySecret'),
      twimlAppSid: config.getOrThrow<string>('twilio.twimlAppSid'),
      phoneNumber: config.getOrThrow<string>('twilio.phoneNumber'),
      webhookBaseUrl: config.getOrThrow<string>('twilio.webhookBaseUrl'),
    }
    this.apiPrefix = config.getOrThrow<string>('app.apiPrefix')
    this.client = twilio(this.settings.accountSid, this.settings.authToken)
  }

  webhookUrl(path: string, tenantId?: string): string {
    const url = `${this.settings.webhookBaseUrl}/${this.apiPrefix}/${path}`
    return tenantId === undefined ? url : `${url}?tenant=${tenantId}`
  }
}
