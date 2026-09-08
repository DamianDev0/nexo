import {
  optionalField,
  requiredField,
  type TwilioWebhookBody,
} from '@/shared/integrations/twilio/twilio-webhook.util'
import type { MessageStatusCallback } from '../interfaces/message-row.interfaces'

export function parseMessageStatusCallback(body: TwilioWebhookBody): MessageStatusCallback {
  return {
    messageSid: requiredField(body, 'MessageSid'),
    twilioStatus: requiredField(body, 'MessageStatus'),
    errorCode: optionalField(body, 'ErrorCode'),
  }
}
