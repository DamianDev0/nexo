import {
  optionalField,
  optionalInt,
  requiredField,
  type TwilioWebhookBody,
} from '@/shared/integrations/twilio/twilio-webhook.util'
import { BadRequestException } from '@nestjs/common'
import type {
  DialAction,
  StatusCallback,
  VoiceRequest,
} from '../interfaces/twilio-webhook.interfaces'
import { identityFromClientAddress } from './voice-identity.mapper'

export function parseVoiceRequest(body: TwilioWebhookBody): VoiceRequest {
  const identity = identityFromClientAddress(requiredField(body, 'From'))
  if (identity === null) throw new BadRequestException('Voice request is not client-originated')
  return { callSid: requiredField(body, 'CallSid'), identity, to: requiredField(body, 'To') }
}

export function parseStatusCallback(body: TwilioWebhookBody): StatusCallback {
  return {
    callSid: requiredField(body, 'CallSid'),
    parentCallSid: optionalField(body, 'ParentCallSid'),
    identity: identityFromClientAddress(body.From),
    twilioStatus: requiredField(body, 'CallStatus'),
    durationSeconds: optionalInt(body, 'CallDuration') ?? 0,
    sequence: optionalInt(body, 'SequenceNumber'),
  }
}

export function parseDialAction(body: TwilioWebhookBody): DialAction {
  return {
    callSid: requiredField(body, 'CallSid'),
    twilioStatus: requiredField(body, 'DialCallStatus'),
    durationSeconds: optionalInt(body, 'DialCallDuration') ?? 0,
  }
}
