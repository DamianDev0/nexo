import type { ConsentChannel } from '@repo/shared-types'

export interface ContactConsentRow {
  id: string
  contact_id: string
  channel: ConsentChannel
  granted: boolean
  granted_at: string | null
  revoked_at: string | null
  source: string | null
  reason: string | null
  evidence: Record<string, unknown> | null
  updated_at: string
}

export interface UpsertConsentData {
  contactId: string
  channel: ConsentChannel
  granted: boolean
  source: string | null
  reason: string | null
  evidence: Record<string, unknown> | null
  recordedBy: string | null
}
