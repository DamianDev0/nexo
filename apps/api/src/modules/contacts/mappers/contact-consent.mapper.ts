import type { ContactConsent } from '@repo/shared-types'
import type { ContactConsentRow } from '../interfaces/contact-consent-row.interfaces'

export function mapContactConsent(r: ContactConsentRow): ContactConsent {
  return {
    id: r.id,
    contactId: r.contact_id,
    channel: r.channel,
    granted: r.granted,
    grantedAt: r.granted_at,
    revokedAt: r.revoked_at,
    source: r.source,
    reason: r.reason,
    evidence: r.evidence,
    updatedAt: r.updated_at,
  }
}
