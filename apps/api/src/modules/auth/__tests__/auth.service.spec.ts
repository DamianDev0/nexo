import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { getLoggerToken } from 'nestjs-pino'
import { UserRole } from '@repo/shared-types'
import type { TenantContext } from '@repo/shared-types'

import { AuthService } from '../services/auth.service'
import { AuthRepository } from '../repositories/auth.repository'
import { SessionRepository } from '../repositories/session.repository'
import { CacheService } from '@/shared/cache/cache.service'
import { PasswordService } from '@/shared/security/password.service'
import { AuditLogService } from '@/shared/audit-log/audit-log.service'
import { EventBusService } from '@/shared/events/event-bus.service'
import { TenantsService } from '@/modules/tenants/services/tenants.service'
import { Tenant } from '@/modules/tenants/entities/tenant.entity'
import { AUTH_EVENTS, TenantOnboardedEvent } from '@/shared/events/auth.events'
import type { UserRow, RequestMeta } from '../interfaces/auth-rows.interface'
import type { OnboardingDto } from '../dto/onboarding.dto'

const SCHEMA = 'tenant_acme'

const mockUser: UserRow = {
  id: 'user-1',
  email: 'owner@acme.com',
  full_name: 'John Doe',
  avatar_url: null,
  role: UserRole.OWNER,
  password_hash: '$hash',
  is_active: true,
}

const mockTenantCtx: TenantContext = {
  tenantId: 'tenant-1',
  slug: 'acme',
  schemaName: SCHEMA,
  plan: 'free',
  config: {},
  productName: 'NexoCRM',
  customDomain: null,
}

const mockAuthResult = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: {
    id: mockUser.id,
    email: mockUser.email,
    fullName: mockUser.full_name,
    role: mockUser.role,
    avatarUrl: null,
  },
}

const mockTenantResponse = {
  id: 'tenant-1',
  slug: 'acme',
  name: 'Acme Corp',
  schemaName: SCHEMA,
  plan: 'free',
}

const mockMeta: RequestMeta = { ip: '127.0.0.1', userAgent: 'jest' }

function buildMocks() {
  return {
    authRepo: {
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      countUsers: jest.fn(),
      createOwnerUser: jest.fn(),
      findOrCreateGoogleUser: jest.fn(),
    },
    session: {
      issue: jest.fn(),
      findByRawToken: jest.fn(),
      revokeById: jest.fn(),
      revokeByRawToken: jest.fn(),
      revokeAllForUser: jest.fn(),
    },
    cache: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
    password: { hash: jest.fn(), compare: jest.fn() },
    tenantsService: { create: jest.fn(), delete: jest.fn() },
    audit: {
      authLogin: jest.fn(),
      authLoginFailed: jest.fn(),
      authLoginGoogle: jest.fn(),
      authLogout: jest.fn(),
      authTokenRefreshed: jest.fn(),
      authSessionsRevoked: jest.fn(),
      tenantCreated: jest.fn(),
      userCreated: jest.fn(),
    },
    eventBus: { emit: jest.fn() },
    tenantRepo: { findOne: jest.fn() },
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  }
}

describe('AuthService', () => {
  let service: AuthService
  let mocks: ReturnType<typeof buildMocks>

  beforeEach(async () => {
    mocks = buildMocks()

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getLoggerToken(AuthService.name), useValue: mocks.logger },
        { provide: AuthRepository, useValue: mocks.authRepo },
        { provide: SessionRepository, useValue: mocks.session },
        { provide: CacheService, useValue: mocks.cache },
        { provide: PasswordService, useValue: mocks.password },
        { provide: TenantsService, useValue: mocks.tenantsService },
        { provide: AuditLogService, useValue: mocks.audit },
        { provide: EventBusService, useValue: mocks.eventBus },
        { provide: getRepositoryToken(Tenant), useValue: mocks.tenantRepo },
      ],
    }).compile()

    service = module.get(AuthService)
  })

  // ─── onboard ────────────────────────────────────────────────────────────────

  describe('onboard', () => {
    const dto: OnboardingDto = {
      businessName: 'Acme Corp',
      slug: 'acme',
      ownerEmail: 'owner@acme.com',
      ownerPassword: 'secret123',
      ownerFullName: 'John Doe',
    }

    beforeEach(() => {
      mocks.tenantsService.create.mockResolvedValue(mockTenantResponse)
      mocks.authRepo.countUsers.mockResolvedValue(0)
      mocks.password.hash.mockResolvedValue('$hash')
      mocks.authRepo.createOwnerUser.mockResolvedValue(mockUser)
      mocks.session.issue.mockResolvedValue(mockAuthResult)
      mocks.audit.tenantCreated.mockResolvedValue(undefined)
      mocks.audit.userCreated.mockResolvedValue(undefined)
    })

    it('creates tenant, owner user, issues session, emits event, and returns result', async () => {
      const result = await service.onboard(dto, mockMeta)

      expect(mocks.tenantsService.create).toHaveBeenCalledWith({
        name: dto.businessName,
        slug: dto.slug,
        planName: dto.planName,
      })
      expect(mocks.authRepo.countUsers).toHaveBeenCalledWith(SCHEMA)
      expect(mocks.password.hash).toHaveBeenCalledWith(dto.ownerPassword)
      expect(mocks.authRepo.createOwnerUser).toHaveBeenCalledWith(
        SCHEMA,
        dto.ownerEmail,
        '$hash',
        dto.ownerFullName,
      )
      expect(mocks.session.issue).toHaveBeenCalled()
      expect(mocks.eventBus.emit).toHaveBeenCalledWith(
        AUTH_EVENTS.TENANT_ONBOARDED,
        expect.any(TenantOnboardedEvent),
      )
      expect(result.tenant.slug).toBe('acme')
      expect(result.accessToken).toBe('access-token')
    })

    it('rolls back tenant and rethrows when user creation fails', async () => {
      const error = new Error('DB failure')
      mocks.authRepo.createOwnerUser.mockRejectedValue(error)

      await expect(service.onboard(dto, mockMeta)).rejects.toThrow('DB failure')
      expect(mocks.tenantsService.delete).toHaveBeenCalledWith(mockTenantResponse.id)
    })

    it('throws ConflictException if tenant already has users', async () => {
      mocks.authRepo.countUsers.mockResolvedValue(1)

      await expect(service.onboard(dto, mockMeta)).rejects.toThrow(ConflictException)
      expect(mocks.tenantsService.delete).toHaveBeenCalledWith(mockTenantResponse.id)
    })
  })

  // ─── validateUser ────────────────────────────────────────────────────────────

  describe('validateUser', () => {
    const ip = '1.2.3.4'

    beforeEach(() => {
      mocks.cache.get.mockResolvedValue(null)
      mocks.cache.set.mockResolvedValue(undefined)
      mocks.cache.del.mockResolvedValue(undefined)
    })

    it('returns user on valid credentials', async () => {
      mocks.authRepo.findUserByEmail.mockResolvedValue(mockUser)
      mocks.password.compare.mockResolvedValue(true)

      const result = await service.validateUser('owner@acme.com', 'secret', SCHEMA, ip)

      expect(result).toEqual(mockUser)
      expect(mocks.cache.del).toHaveBeenCalled()
    })

    it('throws UnauthorizedException when user is not found', async () => {
      mocks.authRepo.findUserByEmail.mockResolvedValue(undefined)

      await expect(service.validateUser('x@x.com', 'pass', SCHEMA, ip)).rejects.toThrow(
        UnauthorizedException,
      )
      expect(mocks.audit.authLoginFailed).toHaveBeenCalledWith(
        'x@x.com',
        'user_not_found',
        SCHEMA,
        { ip },
      )
    })

    it('throws UnauthorizedException when account is disabled', async () => {
      mocks.authRepo.findUserByEmail.mockResolvedValue({ ...mockUser, is_active: false })

      await expect(service.validateUser('owner@acme.com', 'secret', SCHEMA, ip)).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('throws UnauthorizedException on wrong password', async () => {
      mocks.authRepo.findUserByEmail.mockResolvedValue(mockUser)
      mocks.password.compare.mockResolvedValue(false)

      await expect(service.validateUser('owner@acme.com', 'wrong', SCHEMA, ip)).rejects.toThrow(
        UnauthorizedException,
      )
      expect(mocks.audit.authLoginFailed).toHaveBeenCalledWith(
        'owner@acme.com',
        'invalid_password',
        SCHEMA,
        { ip },
        mockUser.id,
      )
    })

    it('throws ForbiddenException when rate limit is exceeded', async () => {
      mocks.cache.get.mockResolvedValue(10)

      await expect(service.validateUser('owner@acme.com', 'pass', SCHEMA, ip)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('increments failed attempt counter on bad password', async () => {
      mocks.cache.get.mockResolvedValue(null)
      mocks.authRepo.findUserByEmail.mockResolvedValue(mockUser)
      mocks.password.compare.mockResolvedValue(false)

      await expect(service.validateUser('owner@acme.com', 'bad', SCHEMA, ip)).rejects.toThrow(
        UnauthorizedException,
      )
      expect(mocks.cache.set).toHaveBeenCalledWith(`auth:fail:${SCHEMA}:${ip}`, 1, 900)
    })
  })

  // ─── login ───────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('issues a session and records audit event', async () => {
      mocks.session.issue.mockResolvedValue(mockAuthResult)
      mocks.audit.authLogin.mockResolvedValue(undefined)

      const result = await service.login(mockUser, mockTenantCtx, mockMeta)

      expect(mocks.session.issue).toHaveBeenCalledWith(mockUser, mockTenantCtx, mockMeta)
      expect(mocks.audit.authLogin).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email },
        SCHEMA,
        mockMeta,
      )
      expect(result.accessToken).toBe('access-token')
    })
  })

  // ─── refresh ─────────────────────────────────────────────────────────────────

  describe('refresh', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString()

    it('rotates tokens successfully', async () => {
      mocks.session.findByRawToken.mockResolvedValue({
        id: 'session-1',
        user_id: mockUser.id,
        token_hash: 'hash',
        expires_at: futureDate,
        revoked_at: null,
      })
      mocks.authRepo.findUserById.mockResolvedValue(mockUser)
      mocks.session.issue.mockResolvedValue(mockAuthResult)
      mocks.audit.authTokenRefreshed.mockResolvedValue(undefined)

      const result = await service.refresh('raw-token', mockTenantCtx, mockMeta)

      expect(mocks.session.revokeById).toHaveBeenCalledWith(SCHEMA, 'session-1')
      expect(result.accessToken).toBe('access-token')
    })

    it('throws UnauthorizedException when token is not found', async () => {
      mocks.session.findByRawToken.mockResolvedValue(undefined)

      await expect(service.refresh('bad-token', mockTenantCtx, mockMeta)).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('revokes all sessions and throws on token reuse', async () => {
      mocks.session.findByRawToken.mockResolvedValue({
        id: 'session-1',
        user_id: mockUser.id,
        token_hash: 'hash',
        expires_at: futureDate,
        revoked_at: new Date().toISOString(),
      })
      mocks.session.revokeAllForUser.mockResolvedValue(undefined)
      mocks.audit.authSessionsRevoked.mockResolvedValue(undefined)

      await expect(service.refresh('reused-token', mockTenantCtx, mockMeta)).rejects.toThrow(
        UnauthorizedException,
      )
      expect(mocks.session.revokeAllForUser).toHaveBeenCalledWith(SCHEMA, mockUser.id)
      expect(mocks.audit.authSessionsRevoked).toHaveBeenCalled()
    })

    it('throws UnauthorizedException when token is expired', async () => {
      mocks.session.findByRawToken.mockResolvedValue({
        id: 'session-1',
        user_id: mockUser.id,
        token_hash: 'hash',
        expires_at: new Date(Date.now() - 1000).toISOString(),
        revoked_at: null,
      })

      await expect(service.refresh('expired-token', mockTenantCtx, mockMeta)).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('throws UnauthorizedException when user is not found after token lookup', async () => {
      mocks.session.findByRawToken.mockResolvedValue({
        id: 'session-1',
        user_id: 'ghost-user',
        token_hash: 'hash',
        expires_at: futureDate,
        revoked_at: null,
      })
      mocks.authRepo.findUserById.mockResolvedValue(undefined)

      await expect(service.refresh('raw-token', mockTenantCtx, mockMeta)).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  // ─── logout ──────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('revokes the refresh token and logs audit event', async () => {
      mocks.session.revokeByRawToken.mockResolvedValue(undefined)
      mocks.audit.authLogout.mockResolvedValue(undefined)

      await service.logout('raw-token', SCHEMA, mockMeta)

      expect(mocks.session.revokeByRawToken).toHaveBeenCalledWith(SCHEMA, 'raw-token')
      expect(mocks.audit.authLogout).toHaveBeenCalledWith(SCHEMA, mockMeta)
    })
  })

  // ─── validateGoogleUser ──────────────────────────────────────────────────────

  describe('validateGoogleUser', () => {
    const profile = {
      email: 'google@acme.com',
      fullName: 'Google User',
      avatarUrl: 'https://avatar.url',
      slug: 'acme',
    }

    const mockTenantEntity = {
      id: 'tenant-1',
      slug: 'acme',
      schemaName: SCHEMA,
      isActive: true,
      plan: { name: 'free' },
      config: {},
      productName: 'NexoCRM',
      customDomain: null,
    }

    it('finds or creates a Google user and issues session', async () => {
      mocks.tenantRepo.findOne.mockResolvedValue(mockTenantEntity)
      mocks.authRepo.findOrCreateGoogleUser.mockResolvedValue(mockUser)
      mocks.session.issue.mockResolvedValue(mockAuthResult)
      mocks.audit.authLoginGoogle.mockResolvedValue(undefined)

      const result = await service.validateGoogleUser(profile, mockMeta)

      expect(mocks.authRepo.findOrCreateGoogleUser).toHaveBeenCalledWith(
        SCHEMA,
        profile.email,
        profile.fullName,
        profile.avatarUrl,
      )
      expect(result.tenantCtx.schemaName).toBe(SCHEMA)
    })

    it('throws NotFoundException when tenant does not exist', async () => {
      mocks.tenantRepo.findOne.mockResolvedValue(null)

      await expect(service.validateGoogleUser(profile, mockMeta)).rejects.toThrow(NotFoundException)
    })

    it('throws UnauthorizedException when Google user account is disabled', async () => {
      mocks.tenantRepo.findOne.mockResolvedValue(mockTenantEntity)
      mocks.authRepo.findOrCreateGoogleUser.mockResolvedValue({ ...mockUser, is_active: false })

      await expect(service.validateGoogleUser(profile, mockMeta)).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })
})
