export const CONSENT_CHANNELS = ['data_processing', 'email', 'sms', 'whatsapp', 'call'] as const

export type ConsentChannel = (typeof CONSENT_CHANNELS)[number]

export type ContactConsent = {
  id: string
  contactId: string
  channel: ConsentChannel
  granted: boolean
  grantedAt: string | null
  revokedAt: string | null
  source: string | null
  reason: string | null
  evidence: Record<string, unknown> | null
  updatedAt: string
}

export type ContactConsentInput = {
  channel: ConsentChannel
  granted: boolean
  source?: string
  reason?: string
  evidence?: Record<string, unknown>
}
