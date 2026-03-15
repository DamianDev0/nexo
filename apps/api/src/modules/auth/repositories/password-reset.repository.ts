import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  PasswordResetRow,
  CreateResetTokenData,
} from '../interfaces/password-reset-rows.interface'

@Injectable()
export class PasswordResetRepository {
  constructor(private readonly tenantDb: TenantDbService) {}

  async create(schemaName: string, data: CreateResetTokenData): Promise<void> {
    // Revoke any existing unused tokens for the user before issuing a new one
    await this.tenantDb.query(schemaName, async (qr) => {
      await qr.query(
        `UPDATE "${schemaName}".password_reset_tokens
         SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`,
        [data.userId],
      )
      await qr.query(
        `INSERT INTO "${schemaName}".password_reset_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [data.userId, data.tokenHash, data.expiresAt],
      )
    })
  }

  async findByTokenHash(
    schemaName: string,
    tokenHash: string,
  ): Promise<PasswordResetRow | undefined> {
    return this.tenantDb.query<PasswordResetRow | undefined>(schemaName, async (qr) => {
      const raw: unknown = await qr.query(
        `SELECT id, user_id, token_hash, expires_at, used_at
         FROM "${schemaName}".password_reset_tokens
         WHERE token_hash = $1 LIMIT 1`,
        [tokenHash],
      )
      return (raw as PasswordResetRow[])[0]
    })
  }

  async markUsed(schemaName: string, id: string): Promise<void> {
    await this.tenantDb.query(schemaName, async (qr) => {
      await qr.query(
        `UPDATE "${schemaName}".password_reset_tokens SET used_at = NOW() WHERE id = $1`,
        [id],
      )
    })
  }
}
