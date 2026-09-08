import { Injectable } from '@nestjs/common'
import type { OutboundSms, OutboundSmsResult } from './interfaces/twilio.interfaces'
import { TwilioSettingsService } from './twilio-settings.service'

@Injectable()
export class TwilioMessagingService {
  constructor(private readonly twilio: TwilioSettingsService) {}

  get senderNumber(): string {
    return this.twilio.settings.phoneNumber
  }

  async sendSms(sms: OutboundSms): Promise<OutboundSmsResult> {
    const message = await this.twilio.client.messages.create({
      from: this.senderNumber,
      to: sms.to,
      body: sms.body,
      statusCallback: sms.statusCallbackUrl,
    })
    return {
      sid: message.sid,
      status: message.status,
      segments: Number.parseInt(message.numSegments, 10) || 1,
    }
  }
}
