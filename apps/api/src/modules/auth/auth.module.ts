import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TenantsModule } from '@/modules/tenants/tenants.module'

import { AuthController } from './controllers/auth.controller'
import { AuthService } from './services/auth.service'
import { PasswordService } from './services/password.service'
import { TokenService } from './services/token.service'
import { AuthRepository } from './repositories/auth.repository'
import { SessionRepository } from './repositories/session.repository'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    PassportModule,
    // JwtModule without global options — TokenService handles signing options per-call
    JwtModule.register({}),
    TenantsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    AuthRepository,
    SessionRepository,
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
