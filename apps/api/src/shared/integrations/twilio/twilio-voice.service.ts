import { Injectable } from '@nestjs/common'
import twilio from 'twilio'
import type { OutboundDialOptions, VoiceAccessToken } from './interfaces/twilio.interfaces'
import { TwilioSettingsService } from './twilio-settings.service'
import {
  DIAL_STATUS_EVENTS,
  DIAL_TIMEOUT_SECONDS,
  VOICE_TOKEN_TTL_SECONDS,
} from './twilio.constants'

const { AccessToken } = twilio.jwt
const { VoiceGrant } = AccessToken
const { VoiceResponse } = twilio.twiml

@Injectable()
export class TwilioVoiceService {
  constructor(private readonly twilio: TwilioSettingsService) {}

  get callerId(): string {
    return this.twilio.settings.phoneNumber
  }

  createAccessToken(identity: string): VoiceAccessToken {
    const { accountSid, apiKeySid, apiKeySecret, twimlAppSid } = this.twilio.settings
    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity,
      ttl: VOICE_TOKEN_TTL_SECONDS,
    })
    token.addGrant(new VoiceGrant({ outgoingApplicationSid: twimlAppSid, incomingAllow: false }))
    return {
      token: token.toJwt(),
      expiresAt: new Date(Date.now() + VOICE_TOKEN_TTL_SECONDS * 1000),
    }
  }

  outboundDialTwiml(options: OutboundDialOptions): string {
    const response = new VoiceResponse()
    const dial = response.dial({
      callerId: this.callerId,
      action: options.actionUrl,
      method: 'POST',
      timeout: DIAL_TIMEOUT_SECONDS,
    })
    dial.number(
      {
        statusCallback: options.statusCallbackUrl,
        statusCallbackMethod: 'POST',
        statusCallbackEvent: [...DIAL_STATUS_EVENTS],
      },
      options.to,
    )
    return response.toString()
  }

  hangupTwiml(): string {
    const response = new VoiceResponse()
    response.hangup()
    return response.toString()
  }

  emptyTwiml(): string {
    return new VoiceResponse().toString()
  }
}
