import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { getLoggerToken } from 'nestjs-pino'
import { ConfigService } from '@nestjs/config'
import type { TenantContext } from '@repo/shared-types'

import { PasswordResetService } from '../services/password-reset.service'
import { AuthRepository } from '../repositories/auth.repository'
import { PasswordResetRepository } from '../repositories/password-reset.repository'
import { SessionRepository } from '../repositories/session.repository'
import { TokenService } from '../services/token.service'
import { PasswordService } from '@/shared/security/password.service'
import { AuditLogService } from '@/shared/audit-log/audit-log.service'
import { ResendService } from '@/shared/integrations/resend/resend.service'
import type { UserRow, RequestMeta } from '../interfaces/auth-rows.interface'
import type { PasswordResetRow } from '../interfaces/password-reset-rows.interface'
import { UserRole } from '@repo/shared-types'

const SCHEMA = 'tenant_acme'

const mockUser: UserRow = {
  id: 'user-1',
  email: 'owner@acme.com',
  full_name: 'John Doe',
  avatar_url: null,
  role: UserRole.OWNER,
  password_hash: '$oldhash',
  is_active: true,
}

const mockTenantCtx: TenantContext = {
  tenantId: 'tenant-1',
  schemaName: SCHEMA,
  plan: 'free',
  config: {},
}

const mockMeta: RequestMeta = { ip: '127.0.0.1', userAgent: 'jest' }

const futureDate = new Date(Date.now() + 30 * 60 * 1000).toISOString()

const mockResetRow: PasswordResetRow = {
  id: 'reset-1',
  user_id: 'user-1',
  token_hash: 'hashedtoken',
  expires_at: futureDate,
  used_at: null,
}

function buildMocks() {
  return {
    authRepo: { findUserByEmail: jest.fn(), findUserById: jest.fn(), updatePassword: jest.fn() },
    resetRepo: { create: jest.fn(), findByTokenHash: jest.fn(), markUsed: jest.fn() },
    session: { revokeAllForUser: jest.fn() },
    password: { hash: jest.fn() },
    token: { generateRefreshToken: jest.fn(), hashToken: jest.fn() },
    audit: { authPasswordResetRequested: jest.fn(), authPasswordChanged: jest.fn() },
    resend: { sendPasswordResetEmail: jest.fn() },
    config: { get: jest.fn() },
    logger: { info: jest.fn(), error: jest.fn() },
  }
}

describe('PasswordResetService', () => {
  let service: PasswordResetService
  let mocks: ReturnType<typeof buildMocks>

  beforeEach(async () => {
    mocks = buildMocks()

    const module = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        { provide: getLoggerToken(PasswordResetService.name), useValue: mocks.logger },
        { provide: AuthRepository, useValue: mocks.authRepo },
        { provide: PasswordResetRepository, useValue: mocks.resetRepo },
        { provide: SessionRepository, useValue: mocks.session },
        { provide: PasswordService, useValue: mocks.password },
        { provide: TokenService, useValue: mocks.token },
        { provide: AuditLogService, useValue: mocks.audit },
        { provide: ResendService, useValue: mocks.resend },
        { provide: ConfigService, useValue: mocks.config },
      ],
    }).compile()

    service = module.get(PasswordResetService)
  })

  // ─── forgotPassword ───────────────────────────────────────────────────────────

  describe('forgotPassword', () => {
    beforeEach(() => {
      mocks.authRepo.findUserByEmail.mockResolvedValue(mockUser)
      mocks.token.generateRefreshToken.mockReturnValue('rawtoken')
      mocks.token.hashToken.mockReturnValue('hashedtoken')
      mocks.resetRepo.create.mockResolvedValue(undefined)
      mocks.resend.sendPasswordResetEmail.mockResolvedValue(undefined)
      mocks.audit.authPasswordResetRequested.mockResolvedValue(undefined)
      mocks.config.get.mockReturnValue('http://localhost:3001')
    })

    it('creates a reset token and sends email for a valid active user', async () => {
      await service.forgotPassword('owner@acme.com', mockTenantCtx, mockMeta)

      expect(mocks.resetRepo.create).toHaveBeenCalledWith(
        SCHEMA,
        expect.objectContaining({ userId: 'user-1', tokenHash: 'hashedtoken' }),
      )
      expect(mocks.resend.sendPasswordResetEmail).toHaveBeenCalledWith(
        'owner@acme.com',
        expect.objectContaining({ resetUrl: expect.stringContaining('rawtoken') }),
      )
      expect(mocks.audit.authPasswordResetRequested).toHaveBeenCalledWith(
        'owner@acme.com',
        SCHEMA,
        mockMeta,
      )
    })

    it('returns silently (anti-enumeration) when user is not found', async () => {
      mocks.authRepo.findUserByEmail.mockResolvedValue(undefined)

      await expect(service.forgotPassword('ghost@x.com', mockTenantCtx)).resolves.toBeUndefined()
      expect(mocks.resetRepo.create).not.toHaveBeenCalled()
      expect(mocks.resend.sendPasswordResetEmail).not.toHaveBeenCalled()
    })

    it('returns silently when user is inactive (anti-enumeration)', async () => {
      mocks.authRepo.findUserByEmail.mockResolvedValue({ ...mockUser, is_active: false })

      await expect(service.forgotPassword('owner@acme.com', mockTenantCtx)).resolves.toBeUndefined()
      expect(mocks.resend.sendPasswordResetEmail).not.toHaveBeenCalled()
    })

    it('builds reset URL with the configured frontend URL', async () => {
      mocks.config.get.mockReturnValue('https://app.nexocrm.com')

      await service.forgotPassword('owner@acme.com', mockTenantCtx)

      expect(mocks.resend.sendPasswordResetEmail).toHaveBeenCalledWith(
        'owner@acme.com',
        expect.objectContaining({
          resetUrl: 'https://app.nexocrm.com/reset-password?token=rawtoken',
        }),
      )
    })
  })

  // ─── resetPassword ────────────────────────────────────────────────────────────

  describe('resetPassword', () => {
    beforeEach(() => {
      mocks.token.hashToken.mockReturnValue('hashedtoken')
      mocks.resetRepo.findByTokenHash.mockResolvedValue(mockResetRow)
      mocks.authRepo.findUserById.mockResolvedValue(mockUser)
      mocks.password.hash.mockResolvedValue('$newhash')
      mocks.authRepo.updatePassword.mockResolvedValue(undefined)
      mocks.resetRepo.markUsed.mockResolvedValue(undefined)
      mocks.session.revokeAllForUser.mockResolvedValue(undefined)
      mocks.audit.authPasswordChanged.mockResolvedValue(undefined)
    })

    it('resets password, marks token used, revokes all sessions', async () => {
      await service.resetPassword('rawtoken', 'newpassword', mockTenantCtx, mockMeta)

      expect(mocks.password.hash).toHaveBeenCalledWith('newpassword')
      expect(mocks.authRepo.updatePassword).toHaveBeenCalledWith(SCHEMA, 'user-1', '$newhash')
      expect(mocks.resetRepo.markUsed).toHaveBeenCalledWith(SCHEMA, 'reset-1')
      expect(mocks.session.revokeAllForUser).toHaveBeenCalledWith(SCHEMA, 'user-1')
      expect(mocks.audit.authPasswordChanged).toHaveBeenCalledWith(
        { id: 'user-1', email: 'owner@acme.com' },
        SCHEMA,
        mockMeta,
      )
    })

    it('throws NotFoundException when token does not exist', async () => {
      mocks.resetRepo.findByTokenHash.mockResolvedValue(undefined)

      await expect(service.resetPassword('bad-token', 'pass', mockTenantCtx)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('throws BadRequestException when token was already used', async () => {
      mocks.resetRepo.findByTokenHash.mockResolvedValue({
        ...mockResetRow,
        used_at: new Date().toISOString(),
      })

      await expect(service.resetPassword('used-token', 'pass', mockTenantCtx)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('throws BadRequestException when token is expired', async () => {
      mocks.resetRepo.findByTokenHash.mockResolvedValue({
        ...mockResetRow,
        expires_at: new Date(Date.now() - 1000).toISOString(),
      })

      await expect(service.resetPassword('expired-token', 'pass', mockTenantCtx)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('throws NotFoundException when user associated with token is not found', async () => {
      mocks.authRepo.findUserById.mockResolvedValue(undefined)

      await expect(service.resetPassword('rawtoken', 'pass', mockTenantCtx)).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
