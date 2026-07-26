import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'
import type { JwtPayload } from '@repo/shared-types'

function cookieOrBearerExtractor(req: Request): string | null {
  const fromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req)
  if (fromHeader) return fromHeader

  const cookie = req.cookies as Record<string, string> | undefined
  return cookie?.['access_token'] ?? null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: cookieOrBearerExtractor,
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKey: config.get<string>('jwt.publicKey') ?? '',
    })
  }

  validate(payload: JwtPayload) {
    if (!payload.sub || !payload.tenantId || !payload.schemaName) {
      throw new UnauthorizedException('Invalid token payload')
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      schemaName: payload.schemaName,
    }
  }
}
