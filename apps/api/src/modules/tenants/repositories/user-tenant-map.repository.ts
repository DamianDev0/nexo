import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { UserEmailRow } from '../interfaces/user-tenant-map-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class UserTenantMapRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findActiveUserEmails(schemaName: string): Promise<UserEmailRow[]> {
    return this.tenantDb.query(schemaName, async (qr) => {
      const rows = await sqlRows<UserEmailRow[]>(
        qr,
        `SELECT LOWER(email) as email FROM "${schemaName}".users WHERE is_active = true`,
      )
      return rows
    })
  }
}
