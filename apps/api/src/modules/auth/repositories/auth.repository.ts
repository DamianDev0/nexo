import { Injectable } from '@nestjs/common'
import { UserRole } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { UserRow } from '../interfaces/auth-rows.interface'

@Injectable()
export class AuthRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findUserByEmail(schemaName: string, email: string): Promise<UserRow | undefined> {
    return this.tenantDb.query<UserRow | undefined>(schemaName, async (qr) => {
      const rows = (await qr.query(
        `SELECT id, email, full_name, avatar_url, role, password_hash, is_active
         FROM "${schemaName}".users
         WHERE email = $1
         LIMIT 1`,
        [email.toLowerCase()],
      )) as UserRow[]
      return rows[0]
    })
  }

  async findUserById(schemaName: string, id: string): Promise<UserRow | undefined> {
    return this.tenantDb.query<UserRow | undefined>(schemaName, async (qr) => {
      const rows = (await qr.query(
        `SELECT id, email, full_name, avatar_url, role, password_hash, is_active
         FROM "${schemaName}".users
         WHERE id = $1 AND is_active = true
         LIMIT 1`,
        [id],
      )) as UserRow[]
      return rows[0]
    })
  }

  async countUsers(schemaName: string): Promise<number> {
    return this.tenantDb.query<number>(schemaName, async (qr) => {
      const rows = (await qr.query(
        `SELECT COUNT(*)::int AS count FROM "${schemaName}".users`,
      )) as Array<{ count: number }>
      return rows[0]?.count ?? 0
    })
  }

  async createOwnerUser(
    schemaName: string,
    email: string,
    passwordHash: string,
    fullName: string,
  ): Promise<UserRow> {
    return this.tenantDb.transactional<UserRow>(schemaName, async (qr) => {
      const rows = (await qr.query(
        `INSERT INTO "${schemaName}".users (email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, full_name, avatar_url, role, password_hash, is_active`,
        [email.toLowerCase(), passwordHash, fullName, UserRole.OWNER],
      )) as UserRow[]
      const created = rows[0]
      if (!created) throw new Error('INSERT returned no rows')
      return created
    })
  }
}
