import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import type { TenantContext } from '@repo/shared-types'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { CacheService } from '@/shared/cache/cache.service'
import { AuditLogService } from '@/shared/audit-log/audit-log.service'
import { PasswordService } from '@/shared/security/password.service'
import { EventBusService } from '@/shared/events/event-bus.service'
import { AUTH_EVENTS, TenantOnboardedEvent } from '@/shared/events/auth.events'
import { TenantsService } from '@/modules/tenants/services/tenants.service'
import { AuthRepository } from '../repositories/auth.repository'
import { SessionRepository } from '../repositories/session.repository'
import type { OnboardingDto } from '../dto/onboarding.dto'
import type { GoogleProfile } from '../interfaces/google-profile.interface'
import type {
  UserRow,
  RequestMeta,
  AuthResult,
  OnboardingResult,
  GoogleAuthResult,
} from '../interfaces/auth-rows.interface'

const RATE_LIMIT_MAX_ATTEMPTS = 10
const RATE_LIMIT_WINDOW_SECONDS = 900 // 15 minutes

// Scoped per tenant+IP to avoid cross-tenant lockouts behind shared NAT
function rateLimitCacheKey(schemaName: string, ip: string): string {
  return `auth:fail:${schemaName}:${ip}`
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
    private readonly audit: AuditLogService,
    private readonly eventBus: EventBusService,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  // ─── Onboarding ───────────────────────────────────────────────────────────

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
    let owner: UserRow
    try {
      if ((await this.authRepo.countUsers(tenantCtx.schemaName)) > 0) {
        throw new ConflictException('Tenant already has users.')
      }
      const hash = await this.password.hash(dto.ownerPassword)
      owner = await this.authRepo.createOwnerUser(
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

    await this.audit.tenantCreated(tenant, tenantCtx.schemaName, meta)
    await this.audit.userCreated(
      { id: owner.id, email: owner.email },
      owner.role,
      tenantCtx.schemaName,
      meta,
    )

    this.eventBus.emit(
      AUTH_EVENTS.TENANT_ONBOARDED,
      new TenantOnboardedEvent(
        dto.ownerEmail,
        dto.ownerFullName,
        dto.businessName,
        tenantCtx.schemaName,
      ),
    )

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
    await this.checkRateLimit(schemaName, ip)

    const user = await this.authRepo.findUserByEmail(schemaName, email)

    if (!user?.password_hash) {
      await this.recordFailedAttempt(schemaName, ip)
      await this.audit.authLoginFailed(email, 'user_not_found', schemaName, { ip })
      throw new UnauthorizedException('Invalid credentials')
    }

    if (!user.is_active) throw new UnauthorizedException('Account is disabled')

    const valid = await this.password.compare(rawPassword, user.password_hash)
    if (!valid) {
      await this.recordFailedAttempt(schemaName, ip)
      await this.audit.authLoginFailed(email, 'invalid_password', schemaName, { ip }, user.id)
      throw new UnauthorizedException('Invalid credentials')
    }

    await this.clearRateLimit(schemaName, ip)
    return user
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  async login(user: UserRow, tenantCtx: TenantContext, meta: RequestMeta): Promise<AuthResult> {
    const result = await this.session.issue(user, tenantCtx, meta)
    await this.audit.authLogin({ id: user.id, email: user.email }, tenantCtx.schemaName, meta)
    return result
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────

  async validateGoogleUser(profile: GoogleProfile, meta: RequestMeta): Promise<GoogleAuthResult> {
    const tenant = await this.tenantRepo.findOne({
      where: { slug: profile.slug, isActive: true },
      relations: ['plan'],
    })
    if (!tenant) throw new NotFoundException(`Tenant '${profile.slug}' not found`)

    const tenantCtx: TenantContext = {
      tenantId: tenant.id,
      schemaName: tenant.schemaName,
      plan: tenant.plan.name,
      config: tenant.config ?? {},
    }

    const user = await this.authRepo.findOrCreateGoogleUser(
      tenantCtx.schemaName,
      profile.email,
      profile.fullName,
      profile.avatarUrl,
    )
    if (!user.is_active) throw new UnauthorizedException('Account is disabled')

    this.logger.info({ slug: tenant.slug, email: profile.email }, 'Google OAuth login')

    const authResult = await this.session.issue(user, tenantCtx, meta)
    await this.audit.authLoginGoogle({ id: user.id, email: user.email }, tenantCtx.schemaName, meta)
    return { ...authResult, tenantCtx }
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
      await this.audit.authSessionsRevoked(row.user_id, schemaName, meta)
      throw new UnauthorizedException('Refresh token reuse detected. All sessions invalidated.')
    }

    if (new Date(row.expires_at) < new Date())
      throw new UnauthorizedException('Refresh token expired')

    await this.session.revokeById(schemaName, row.id)

    const user = await this.authRepo.findUserById(schemaName, row.user_id)
    if (!user) throw new UnauthorizedException('User not found or disabled')

    const result = await this.session.issue(user, tenantCtx, meta)
    await this.audit.authTokenRefreshed({ id: user.id, email: user.email }, schemaName, meta)
    return result
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout(rawRefreshToken: string, schemaName: string, meta?: RequestMeta): Promise<void> {
    await this.session.revokeByRawToken(schemaName, rawRefreshToken)
    await this.audit.authLogout(schemaName, meta)
  }

  // ─── Rate limiting (scoped per tenant+IP) ─────────────────────────────────

  private async checkRateLimit(schemaName: string, ip: string): Promise<void> {
    const count = await this.cache.get<number>(rateLimitCacheKey(schemaName, ip))
    if (count && count >= RATE_LIMIT_MAX_ATTEMPTS) {
      throw new ForbiddenException('Too many failed login attempts. Try again in 15 minutes.')
    }
  }

  private async recordFailedAttempt(schemaName: string, ip: string): Promise<void> {
    const key = rateLimitCacheKey(schemaName, ip)
    const current = (await this.cache.get<number>(key)) ?? 0
    await this.cache.set(key, current + 1, RATE_LIMIT_WINDOW_SECONDS)
  }

  private async clearRateLimit(schemaName: string, ip: string): Promise<void> {
    await this.cache.del(rateLimitCacheKey(schemaName, ip))
  }
}
