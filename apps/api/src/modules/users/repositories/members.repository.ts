import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { sqlRows } from '@/shared/database/sql.util'
import type { MemberRow } from '../interfaces/member-row.interface'

@Injectable()
export class MembersRepository {
  constructor(private readonly db: TenantDbService) {}

  async listActive(schemaName: string): Promise<MemberRow[]> {
    return this.db.query(schemaName, async (qr) =>
      sqlRows<MemberRow[]>(
        qr,
        `SELECT id, email, full_name, avatar_url, role
         FROM users
         WHERE is_active = true
         ORDER BY full_name ASC, email ASC`,
      ),
    )
  }
}
