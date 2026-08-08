import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { ApiKeyRow, InsertApiKeyData } from '../interfaces/api-key-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class ApiKeysRepository {
  constructor(private readonly db: TenantDbService) {}

  async findAllActive(schemaName: string): Promise<ApiKeyRow[]> {
    return this.db.query(schemaName, async (qr): Promise<ApiKeyRow[]> => {
      const rows = await sqlRows<ApiKeyRow[]>(
        qr,
        `SELECT * FROM api_keys WHERE is_active = true ORDER BY created_at DESC`,
      )
      return rows
    })
  }

  async insert(schemaName: string, data: InsertApiKeyData): Promise<ApiKeyRow> {
    return this.db.query(schemaName, async (qr): Promise<ApiKeyRow> => {
      const rows = await sqlRows<ApiKeyRow[]>(
        qr,
        `INSERT INTO api_keys (name, key_hash, key_prefix, scopes, expires_at, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [data.name, data.keyHash, data.keyPrefix, data.scopes, data.expiresAt, data.createdBy],
      )

      const row = rows[0]
      if (!row) throw new Error('Failed to create API key')
      return row
    })
  }

  async deactivateById(schemaName: string, keyId: string): Promise<number> {
    return this.db.query(schemaName, async (qr): Promise<number> => {
      const rows = await sqlRows<ApiKeyRow[]>(
        qr,
        `UPDATE api_keys SET is_active = false WHERE id = $1 RETURNING id`,
        [keyId],
      )
      return rows.length
    })
  }

  async findActiveByHashAndMarkUsed(
    schemaName: string,
    keyHash: string,
  ): Promise<ApiKeyRow | null> {
    return this.db.query(schemaName, async (qr): Promise<ApiKeyRow | null> => {
      const rows = await sqlRows<ApiKeyRow[]>(
        qr,
        `SELECT * FROM api_keys WHERE key_hash = $1 AND is_active = true`,
        [keyHash],
      )

      const row = rows[0]
      if (!row) return null

      if (row.expires_at && new Date(row.expires_at) < new Date()) return null

      await qr.query(`UPDATE api_keys SET last_used_at = NOW() WHERE id = $1`, [row.id])
      return row
    })
  }
}
