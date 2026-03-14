import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { TenantContext } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { TokenService } from '../services/token.service'
import type {
  UserRow,
  RefreshTokenRow,
  RequestMeta,
  AuthResult,
} from '../interfaces/auth-rows.interface'

interface StoreRefreshTokenData {
  userId: string
  tokenHash: string
  expiresAt: Date
  ip: string | null
  userAgent: string | null
}

@Injectable()
export class SessionRepository {
  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly token: TokenService,
    private readonly config: ConfigService,
  ) {}

  async findByRawToken(schemaName: string, rawToken: string): Promise<RefreshTokenRow | undefined> {
    return this.findByTokenHash(schemaName, this.token.hashToken(rawToken))
  }

  async findByTokenHash(schemaName: string, hash: string): Promise<RefreshTokenRow | undefined> {
    return this.tenantDb.query<RefreshTokenRow | undefined>(schemaName, async (qr) => {
      const rows = (await qr.query(
        `SELECT id, user_id, token_hash, expires_at, revoked_at
         FROM "${schemaName}".refresh_tokens
         WHERE token_hash = $1
         LIMIT 1`,
        [hash],
      )) as RefreshTokenRow[]
      return rows[0]
    })
  }

  async revokeById(schemaName: string, id: string): Promise<void> {
    await this.tenantDb.query<void>(schemaName, async (qr) => {
      await qr.query(`UPDATE "${schemaName}".refresh_tokens SET revoked_at = NOW() WHERE id = $1`, [
        id,
      ])
    })
  }

  async revokeByRawToken(schemaName: string, rawToken: string): Promise<void> {
    await this.revokeByHash(schemaName, this.token.hashToken(rawToken))
  }

  async revokeByHash(schemaName: string, hash: string): Promise<void> {
    await this.tenantDb.query<void>(schemaName, async (qr) => {
      await qr.query(
        `UPDATE "${schemaName}".refresh_tokens SET revoked_at = NOW()
         WHERE token_hash = $1 AND revoked_at IS NULL`,
        [hash],
      )
    })
  }

  async revokeAllForUser(schemaName: string, userId: string): Promise<void> {
    await this.tenantDb.query<void>(schemaName, async (qr) => {
      await qr.query(
        `UPDATE "${schemaName}".refresh_tokens
         SET revoked_at = NOW()
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId],
      )
    })
  }

  async issue(user: UserRow, tenantCtx: TenantContext, meta?: RequestMeta): Promise<AuthResult> {
    const { schemaName, tenantId } = tenantCtx

    const accessToken = this.token.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId,
      schemaName,
    })

    const rawRefreshToken = this.token.generateRefreshToken()
    const tokenHash = this.token.hashToken(rawRefreshToken)
    const refreshExpiresMs = this.config.get<number>('jwt.refreshTokenExpiresInMs', 604800000)
    const expiresAt = new Date(Date.now() + refreshExpiresMs)

    await this.store(schemaName, {
      userId: user.id,
      tokenHash,
      expiresAt,
      ip: meta?.ip ?? null,
      userAgent: meta?.userAgent ?? null,
    })

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url,
      },
    }
  }

  private async store(schemaName: string, data: StoreRefreshTokenData): Promise<void> {
    await this.tenantDb.query<void>(schemaName, async (qr) => {
      await qr.query(
        `INSERT INTO "${schemaName}".refresh_tokens
           (user_id, token_hash, expires_at, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [data.userId, data.tokenHash, data.expiresAt, data.ip, data.userAgent],
      )
    })
  }
}
