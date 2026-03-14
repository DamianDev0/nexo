import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import type { TenantContext } from '@repo/shared-types'
import { CacheService } from '@/shared/cache/cache.service'
import { TenantsService } from '@/modules/tenants/services/tenants.service'
import { PasswordService } from './password.service'
import { AuthRepository } from '../repositories/auth.repository'
import { SessionRepository } from '../repositories/session.repository'
import type { OnboardingDto } from '../dto/onboarding.dto'
import type {
  UserRow,
  RequestMeta,
  AuthResult,
  OnboardingResult,
} from '../interfaces/auth-rows.interface'

const RATE_LIMIT_MAX_ATTEMPTS = 10
const RATE_LIMIT_WINDOW_SECONDS = 900 // 15 minutes

function rateLimitCacheKey(ip: string): string {
  return `auth:fail:${ip}`
}

@Injectable()
export class AuthService {
  constructor(
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
    private readonly authRepo: AuthRepository,
    private readonly session: SessionRepository,
    private readonly cache: CacheService,
    private readonly password: PasswordService,
    private readonly tenantsService: TenantsService,
  ) {}

  // ─── Onboarding (create tenant + owner in one atomic step) ───────────────
  //
  // This is the entry point for new customers. It:
  //   1. Creates the tenant record and provisions the isolated schema.
  //   2. Creates the first user as OWNER.
  //   3. Issues tokens.
  // If user creation fails, the tenant is rolled back to avoid orphaned records.
  // All subsequent users join via invitation (future: POST /users/invite).

  async onboard(dto: OnboardingDto, meta?: RequestMeta): Promise<OnboardingResult> {
    const tenant = await this.tenantsService.create({
      name: dto.businessName,
      slug: dto.slug,
      planName: dto.planName,
    })

    const tenantCtx: TenantContext = {
      tenantId: tenant.id,
      schemaName: tenant.schemaName,
      plan: tenant.plan,
      config: {},
    }

    let authResult: AuthResult
    try {
      const existingCount = await this.authRepo.countUsers(tenantCtx.schemaName)
      if (existingCount > 0) {
        throw new ConflictException('Tenant already has users.')
      }

      const hash = await this.password.hash(dto.ownerPassword)
      const owner = await this.authRepo.createOwnerUser(
        tenantCtx.schemaName,
        dto.ownerEmail,
        hash,
        dto.ownerFullName,
      )
      authResult = await this.session.issue(owner, tenantCtx, meta)
    } catch (error) {
      this.logger.error(
        { slug: tenant.slug },
        'Onboarding failed after tenant creation — rolling back',
      )
      await this.tenantsService.delete(tenant.id)
      throw error
    }

    this.logger.info({ slug: tenant.slug, email: dto.ownerEmail }, 'Onboarding complete')

    return {
      ...authResult,
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        schemaName: tenant.schemaName,
        plan: tenant.plan,
      },
    }
  }

  // ─── Validate credentials (used by LocalStrategy) ─────────────────────────

  async validateUser(
    email: string,
    rawPassword: string,
    schemaName: string,
    ip: string,
  ): Promise<UserRow> {
    await this.checkRateLimit(ip)

    const user = await this.authRepo.findUserByEmail(schemaName, email)

    if (!user?.password_hash) {
      await this.recordFailedAttempt(ip)
      throw new UnauthorizedException('Invalid credentials')
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is disabled')
    }

    const valid = await this.password.compare(rawPassword, user.password_hash)
    if (!valid) {
      await this.recordFailedAttempt(ip)
      throw new UnauthorizedException('Invalid credentials')
    }

    await this.clearRateLimit(ip)
    return user
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  async login(user: UserRow, tenantCtx: TenantContext, meta: RequestMeta): Promise<AuthResult> {
    return this.session.issue(user, tenantCtx, meta)
  }

  // ─── Refresh tokens ───────────────────────────────────────────────────────

  async refresh(
    rawRefreshToken: string,
    tenantCtx: TenantContext,
    meta: RequestMeta,
  ): Promise<AuthResult> {
    const { schemaName } = tenantCtx

    const row = await this.session.findByRawToken(schemaName, rawRefreshToken)
    if (!row) throw new UnauthorizedException('Invalid refresh token')

    if (row.revoked_at) {
      await this.session.revokeAllForUser(schemaName, row.user_id)
      this.logger.warn(
        { userId: row.user_id, schemaName },
        'Refresh token reuse detected — all sessions invalidated',
      )
      throw new UnauthorizedException('Refresh token reuse detected. All sessions invalidated.')
    }

    if (new Date(row.expires_at) < new Date()) {
      throw new UnauthorizedException('Refresh token expired')
    }

    await this.session.revokeById(schemaName, row.id)

    const user = await this.authRepo.findUserById(schemaName, row.user_id)
    if (!user) throw new UnauthorizedException('User not found or disabled')

    return this.session.issue(user, tenantCtx, meta)
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout(rawRefreshToken: string, schemaName: string): Promise<void> {
    await this.session.revokeByRawToken(schemaName, rawRefreshToken)
  }

  // ─── Rate limiting ────────────────────────────────────────────────────────

  async checkRateLimit(ip: string): Promise<void> {
    const count = await this.cache.get<number>(rateLimitCacheKey(ip))
    if (count && count >= RATE_LIMIT_MAX_ATTEMPTS) {
      throw new ForbiddenException('Too many failed login attempts. Try again in 15 minutes.')
    }
  }

  async recordFailedAttempt(ip: string): Promise<void> {
    const key = rateLimitCacheKey(ip)
    const current = (await this.cache.get<number>(key)) ?? 0
    await this.cache.set(key, current + 1, RATE_LIMIT_WINDOW_SECONDS)
  }

  async clearRateLimit(ip: string): Promise<void> {
    await this.cache.del(rateLimitCacheKey(ip))
  }
}
