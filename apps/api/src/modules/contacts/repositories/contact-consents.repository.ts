import { Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { sqlRows } from '@/shared/database/sql.util'
import { CONSENT_COLUMNS } from '../constants/contact.constants'
import type {
  ContactConsentRow,
  UpsertConsentData,
} from '../interfaces/contact-consent-row.interfaces'

@Injectable()
export class ContactConsentsRepository {
  async findByContact(qr: QueryRunner, contactId: string): Promise<ContactConsentRow[]> {
    return sqlRows<ContactConsentRow[]>(
      qr,
      `SELECT ${CONSENT_COLUMNS} FROM data_consents WHERE contact_id = $1 ORDER BY channel`,
      [contactId],
    )
  }

  async upsert(qr: QueryRunner, data: UpsertConsentData): Promise<ContactConsentRow | null> {
    const rows = await sqlRows<ContactConsentRow[]>(
      qr,
      `INSERT INTO data_consents
         (contact_id, channel, granted, granted_at, revoked_at, source, reason, evidence, recorded_by)
       VALUES ($1, $2, $3::boolean,
               CASE WHEN $3::boolean THEN NOW() ELSE NULL END,
               CASE WHEN $3::boolean THEN NULL ELSE NOW() END,
               $4, $5, $6, $7)
       ON CONFLICT (contact_id, channel) DO UPDATE SET
         granted     = EXCLUDED.granted,
         granted_at  = CASE WHEN EXCLUDED.granted THEN NOW() ELSE data_consents.granted_at END,
         revoked_at  = CASE WHEN EXCLUDED.granted THEN NULL ELSE NOW() END,
         source      = COALESCE(EXCLUDED.source, data_consents.source),
         reason      = EXCLUDED.reason,
         evidence    = COALESCE(EXCLUDED.evidence, data_consents.evidence),
         recorded_by = EXCLUDED.recorded_by,
         updated_at  = NOW()
       RETURNING ${CONSENT_COLUMNS}`,
      [
        data.contactId,
        data.channel,
        data.granted,
        data.source,
        data.reason,
        data.evidence,
        data.recordedBy,
      ],
    )
    return rows[0] ?? null
  }
}
