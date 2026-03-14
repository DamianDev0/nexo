import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import type { Request } from 'express'
import type { TenantContext } from '@repo/shared-types'
import { AuthService } from '../services/auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    })
  }

  async validate(req: Request & { tenantContext: TenantContext }, email: string, password: string) {
    const tenantCtx = req.tenantContext
    if (!tenantCtx) {
      throw new UnauthorizedException('Tenant not found')
    }

    const ip = (req.ip ?? req.socket.remoteAddress ?? 'unknown').replace('::ffff:', '')
    return this.authService.validateUser(email, password, tenantCtx.schemaName, ip)
  }
}
