import { Injectable } from '@nestjs/common'
import { sqlRows } from '../sql.util'
import { TenantDbService } from '../tenant-db.service'

@Injectable()
export class ContactPhoneLookupRepository {
  constructor(private readonly db: TenantDbService) {}

  async findContactIdByPhone(schemaName: string, phoneDigits: string): Promise<string | null> {
    return this.db.query(schemaName, async (qr): Promise<string | null> => {
      const rows = await sqlRows<{ id: string }[]>(
        qr,
        `SELECT id FROM contacts
         WHERE is_active = true AND (phone = $1 OR whatsapp = $1)
         ORDER BY updated_at DESC
         LIMIT 1`,
        [phoneDigits],
      )
      return rows[0]?.id ?? null
    })
  }
}
