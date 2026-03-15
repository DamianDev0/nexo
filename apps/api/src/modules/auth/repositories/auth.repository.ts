import { Injectable } from '@nestjs/common'
import { UserRole } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { UserRow } from '../interfaces/auth-rows.interface'

@Injectable()
export class AuthRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async findUserByEmail(schemaName: string, email: string): Promise<UserRow | undefined> {
    return this.tenantDb.query<UserRow | undefined>(schemaName, async (qr) => {
      const raw: unknown = await qr.query(
        `SELECT id, email, full_name, avatar_url, role, password_hash, is_active
         FROM "${schemaName}".users WHERE email = $1 LIMIT 1`,
        [email.toLowerCase()],
      )
      return (raw as UserRow[])[0]
    })
  }

  async findUserById(schemaName: string, id: string): Promise<UserRow | undefined> {
    return this.tenantDb.query<UserRow | undefined>(schemaName, async (qr) => {
      const raw: unknown = await qr.query(
        `SELECT id, email, full_name, avatar_url, role, password_hash, is_active
         FROM "${schemaName}".users WHERE id = $1 AND is_active = true LIMIT 1`,
        [id],
      )
      return (raw as UserRow[])[0]
    })
  }

  async countUsers(schemaName: string): Promise<number> {
    return this.tenantDb.query<number>(schemaName, async (qr) => {
      const raw: unknown = await qr.query(
        `SELECT COUNT(*)::int AS count FROM "${schemaName}".users`,
      )
      return (raw as Array<{ count: number }>)[0]?.count ?? 0
    })
  }

  async createOwnerUser(
    schemaName: string,
    email: string,
    passwordHash: string,
    fullName: string,
  ): Promise<UserRow> {
    return this.tenantDb.transactional<UserRow>(schemaName, async (qr) => {
      const raw: unknown = await qr.query(
        `INSERT INTO "${schemaName}".users (email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, full_name, avatar_url, role, password_hash, is_active`,
        [email.toLowerCase(), passwordHash, fullName, UserRole.OWNER],
      )
      const created = (raw as UserRow[])[0]
      if (!created) throw new Error('INSERT returned no rows')
      return created
    })
  }

  async createInvitedUser(
    schemaName: string,
    email: string,
    passwordHash: string,
    fullName: string,
    role: UserRole,
  ): Promise<UserRow> {
    return this.tenantDb.transactional<UserRow>(schemaName, async (qr) => {
      const raw: unknown = await qr.query(
        `INSERT INTO "${schemaName}".users (email, password_hash, full_name, role, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, email, full_name, avatar_url, role, password_hash, is_active`,
        [email.toLowerCase(), passwordHash, fullName, role],
      )
      const created = (raw as UserRow[])[0]
      if (!created) throw new Error('INSERT returned no rows')
      return created
    })
  }

  async updatePassword(schemaName: string, userId: string, passwordHash: string): Promise<void> {
    await this.tenantDb.query(schemaName, async (qr) => {
      await qr.query(
        `UPDATE "${schemaName}".users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
        [passwordHash, userId],
      )
    })
  }

  async findOrCreateGoogleUser(
    schemaName: string,
    email: string,
    fullName: string,
    avatarUrl: string | null,
  ): Promise<UserRow> {
    return this.tenantDb.transactional<UserRow>(schemaName, async (qr) => {
      const existingRaw: unknown = await qr.query(
        `SELECT id, email, full_name, avatar_url, role, password_hash, is_active
         FROM "${schemaName}".users WHERE email = $1 LIMIT 1`,
        [email.toLowerCase()],
      )
      const existing = (existingRaw as UserRow[])[0]

      if (existing) {
        const updatedRaw: unknown = await qr.query(
          `UPDATE "${schemaName}".users SET avatar_url = $1 WHERE id = $2
           RETURNING id, email, full_name, avatar_url, role, password_hash, is_active`,
          [avatarUrl, existing.id],
        )
        return (updatedRaw as UserRow[])[0] ?? existing
      }

      const insertedRaw: unknown = await qr.query(
        `INSERT INTO "${schemaName}".users (email, full_name, avatar_url, role, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, email, full_name, avatar_url, role, password_hash, is_active`,
        [email.toLowerCase(), fullName, avatarUrl, UserRole.OWNER],
      )
      const created = (insertedRaw as UserRow[])[0]
      if (!created) throw new Error('INSERT returned no rows')
      return created
    })
  }
}
