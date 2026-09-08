import type { ConfigService } from '@nestjs/config'
import { TwilioSettingsService } from '../twilio-settings.service'
import { TwilioVoiceService } from '../twilio-voice.service'

const SETTINGS: Record<string, string> = {
  'twilio.accountSid': 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'twilio.authToken': 'auth-token',
  'twilio.apiKeySid': 'SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'twilio.apiKeySecret': 'api-secret',
  'twilio.twimlAppSid': 'APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'twilio.phoneNumber': '+17372212163',
  'twilio.webhookBaseUrl': 'https://hooks.example.com',
  'app.apiPrefix': 'api/v1',
}

const configStub = { getOrThrow: (key: string) => SETTINGS[key] } as unknown as ConfigService

function decodeJwt(token: string): Record<string, unknown> {
  const payload = token.split('.')[1]!
  return JSON.parse(Buffer.from(payload, 'base64url').toString()) as Record<string, unknown>
}

describe('TwilioVoiceService', () => {
  let service: TwilioVoiceService

  beforeEach(() => {
    service = new TwilioVoiceService(new TwilioSettingsService(configStub))
  })

  it('creates an access token with a voice grant bound to the TwiML app', () => {
    const { token, expiresAt } = service.createAccessToken('tabc_udef')
    const payload = decodeJwt(token)
    const grants = payload.grants as {
      identity: string
      voice: { outgoing: { application_sid: string } }
    }
    expect(grants.identity).toBe('tabc_udef')
    expect(grants.voice.outgoing.application_sid).toBe(SETTINGS['twilio.twimlAppSid'])
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('renders outbound dial TwiML with caller id, action and per-leg status callbacks', () => {
    const xml = service.outboundDialTwiml({
      to: '+573001234567',
      statusCallbackUrl: 'https://hooks.example.com/status?tenant=t1',
      actionUrl: 'https://hooks.example.com/dial-action?tenant=t1',
    })
    expect(xml).toContain('callerId="+17372212163"')
    expect(xml).toContain('action="https://hooks.example.com/dial-action?tenant=t1"')
    expect(xml).toContain('statusCallbackEvent="initiated ringing answered completed"')
    expect(xml).toContain('>+573001234567</Number>')
  })

  it('renders hangup and empty responses', () => {
    expect(service.hangupTwiml()).toContain('<Hangup/>')
    expect(service.emptyTwiml()).toBe('<?xml version="1.0" encoding="UTF-8"?><Response/>')
  })
})

describe('TwilioSettingsService', () => {
  it('builds public webhook URLs under the API prefix, optionally scoped to a tenant', () => {
    const settings = new TwilioSettingsService(configStub)
    expect(settings.webhookUrl('telephony/twilio/voice')).toBe(
      'https://hooks.example.com/api/v1/telephony/twilio/voice',
    )
    expect(settings.webhookUrl('messaging/twilio/status', 't-1')).toBe(
      'https://hooks.example.com/api/v1/messaging/twilio/status?tenant=t-1',
    )
  })
})
