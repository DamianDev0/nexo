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

      // jsonwebtoken types expiresIn as ms.StringValue, a template-literal type no runtime string satisfies
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

  generateRefreshToken(): string {
    return randomBytes(32).toString('hex')
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}
