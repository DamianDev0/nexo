import { ForbiddenException, type ExecutionContext } from '@nestjs/common'
import twilio from 'twilio'
import { TwilioSignatureGuard } from '../twilio-signature.guard'
import type { TwilioSettingsService } from '../twilio-settings.service'

const BASE_URL = 'https://hooks.example.com'
const PATH = '/api/v1/telephony/twilio/voice?tenant=t1'
const AUTH_TOKEN = 'auth-token'

function contextFor(
  headers: Record<string, string>,
  body: Record<string, string>,
): ExecutionContext {
  const req = { headers, body, originalUrl: PATH }
  return { switchToHttp: () => ({ getRequest: () => req }) } as unknown as ExecutionContext
}

describe('TwilioSignatureGuard', () => {
  const guard = new TwilioSignatureGuard({
    settings: { webhookBaseUrl: BASE_URL, authToken: AUTH_TOKEN },
  } as unknown as TwilioSettingsService)
  const body = { CallSid: 'CA1', From: 'client:x' }

  it('rejects requests without a signature header', () => {
    expect(() => guard.canActivate(contextFor({}, body))).toThrow(ForbiddenException)
  })

  it('accepts a signature computed over the public URL including the query string', () => {
    const signature = twilio.getExpectedTwilioSignature(AUTH_TOKEN, `${BASE_URL}${PATH}`, body)
    expect(guard.canActivate(contextFor({ 'x-twilio-signature': signature }, body))).toBe(true)
  })

  it('rejects signatures made with another token or another body', () => {
    const forged = twilio.getExpectedTwilioSignature('other', `${BASE_URL}${PATH}`, body)
    expect(() => guard.canActivate(contextFor({ 'x-twilio-signature': forged }, body))).toThrow(
      ForbiddenException,
    )
    const signature = twilio.getExpectedTwilioSignature(AUTH_TOKEN, `${BASE_URL}${PATH}`, body)
    expect(() =>
      guard.canActivate(contextFor({ 'x-twilio-signature': signature }, { ...body, To: '+1' })),
    ).toThrow(ForbiddenException)
  })
})
