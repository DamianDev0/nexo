import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TenantsModule } from '@/modules/tenants/tenants.module'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'

import { AuthController } from './controllers/auth.controller'
import { AuthService } from './services/auth.service'
import { TokenService } from './services/token.service'
import { PasswordResetService } from './services/password-reset.service'
import { AuthRepository } from './repositories/auth.repository'
import { SessionRepository } from './repositories/session.repository'
import { PasswordResetRepository } from './repositories/password-reset.repository'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { OnboardingListener } from './listeners/onboarding.listener'

@Module({
  imports: [
    PassportModule,
    // JwtModule without global options — TokenService handles signing options per-call
    JwtModule.register({}),
    TypeOrmModule.forFeature([Tenant]),
    TenantsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    PasswordResetService,
    AuthRepository,
    SessionRepository,
    PasswordResetRepository,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    OnboardingListener,
  ],
  exports: [AuthService, TokenService, AuthRepository],
})
export class AuthModule {}
