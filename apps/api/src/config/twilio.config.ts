import { registerAs } from '@nestjs/config'

export const twilioConfig = registerAs('twilio', () => ({
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  apiKeySid: process.env.TWILIO_API_KEY_SID,
  apiKeySecret: process.env.TWILIO_API_KEY_SECRET,
  twimlAppSid: process.env.TWILIO_TWIML_APP_SID,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  webhookBaseUrl: process.env.TWILIO_WEBHOOK_BASE_URL,
}))
