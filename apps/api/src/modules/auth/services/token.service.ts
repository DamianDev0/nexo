import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { createHash, randomBytes } from 'node:crypto'
import type { UserRole } from '@repo/shared-types'
import type { JwtPayload } from '../interfaces/jwt-payload.interface'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  generateAccessToken(payload: {
    sub: string
    email: string
    role: UserRole
    tenantId: string
    schemaName: string
  }): string {
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey: this.config.get<string>('jwt.privateKey'),
      // expiresIn cast needed: @nestjs/jwt expects branded StringValue from 'ms', not plain string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: (this.config.get<string>('jwt.accessTokenExpiresIn') ?? '15m') as any,
    })
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      algorithms: ['RS256'],
      publicKey: this.config.get<string>('jwt.publicKey'),
    })
  }

  /** Generates a cryptographically secure opaque refresh token (32 bytes → 64 hex chars) */
  generateRefreshToken(): string {
    return randomBytes(32).toString('hex')
  }

  /** SHA-256 hash of the opaque token for safe storage in DB */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}
