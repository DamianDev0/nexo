import { Injectable, NotFoundException } from '@nestjs/common'
import { randomBytes, createHash } from 'node:crypto'
import type { ApiKey } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'

interface ApiKeyRow {
  id: string
  name: string
  key_hash: string
  key_prefix: string
  scopes: string[]
  last_used_at: string | null
  expires_at: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
}

@Injectable()
export class ApiKeysService {
  constructor(private readonly db: TenantDbService) {}

  async findAll(schemaName: string): Promise<ApiKey[]> {
    return this.db.query(schemaName, async (qr): Promise<ApiKey[]> => {
      const rows: ApiKeyRow[] = await qr.query(
        `SELECT * FROM api_keys WHERE is_active = true ORDER BY created_at DESC`,
      )
      return rows.map((r) => this.map(r))
    })
  }

  async create(
    schemaName: string,
    data: { name: string; scopes?: string[]; expiresAt?: string },
    userId: string,
  ): Promise<ApiKey & { rawKey: string }> {
    return this.db.query(schemaName, async (qr): Promise<ApiKey & { rawKey: string }> => {
      const rawKey = `nxo_${randomBytes(32).toString('hex')}`
      const keyHash = createHash('sha256').update(rawKey).digest('hex')
      const keyPrefix = rawKey.slice(0, 10)

      const rows: ApiKeyRow[] = await qr.query(
        `INSERT INTO api_keys (name, key_hash, key_prefix, scopes, expires_at, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [data.name, keyHash, keyPrefix, data.scopes ?? ['*'], data.expiresAt ?? null, userId],
      )

      const row = rows[0]
      if (!row) throw new Error('Failed to create API key')
      return { ...this.map(row), rawKey }
    })
  }

  async revoke(schemaName: string, keyId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      const rows: ApiKeyRow[] = await qr.query(
        `UPDATE api_keys SET is_active = false WHERE id = $1 RETURNING id`,
        [keyId],
      )
      if (rows.length === 0) throw new NotFoundException(`API key ${keyId} not found`)
    })
  }

  async validateKey(schemaName: string, rawKey: string): Promise<ApiKeyRow | null> {
    return this.db.query(schemaName, async (qr): Promise<ApiKeyRow | null> => {
      const keyHash = createHash('sha256').update(rawKey).digest('hex')
      const rows: ApiKeyRow[] = await qr.query(
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

  private map(r: ApiKeyRow): ApiKey {
    return {
      id: r.id,
      name: r.name,
      keyPrefix: r.key_prefix,
      scopes: r.scopes ?? [],
      lastUsedAt: r.last_used_at,
      expiresAt: r.expires_at,
      isActive: r.is_active,
      createdAt: r.created_at,
    }
  }
}
