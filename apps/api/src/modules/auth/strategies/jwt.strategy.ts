import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'
import type { JwtPayload } from '@repo/shared-types'

/** Extract JWT from Authorization: Bearer header OR access_token httpOnly cookie */
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
    // Return value is attached to req.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      schemaName: payload.schemaName,
    }
  }
}
