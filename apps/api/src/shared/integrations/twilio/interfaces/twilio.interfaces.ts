export interface TwilioSettings {
  accountSid: string
  authToken: string
  apiKeySid: string
  apiKeySecret: string
  twimlAppSid: string
  phoneNumber: string
  webhookBaseUrl: string
}

export interface OutboundDialOptions {
  to: string
  statusCallbackUrl: string
  actionUrl: string
}

export interface VoiceAccessToken {
  token: string
  expiresAt: Date
}

export interface OutboundSms {
  to: string
  body: string
  statusCallbackUrl: string
}

export interface OutboundSmsResult {
  sid: string
  status: string
  segments: number
}
