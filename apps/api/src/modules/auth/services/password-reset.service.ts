import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import type { TenantContext } from '@repo/shared-types'
import { PasswordService } from '@/shared/security/password.service'
import { AuditLogService } from '@/shared/audit-log/audit-log.service'
import { ResendService } from '@/shared/integrations/resend/resend.service'
import { AuthRepository } from '../repositories/auth.repository'
import { PasswordResetRepository } from '../repositories/password-reset.repository'
import { SessionRepository } from '../repositories/session.repository'
import { TokenService } from './token.service'
import type { UserRow, RequestMeta } from '../interfaces/auth-rows.interface'
import type { PasswordResetRow } from '../interfaces/password-reset-rows.interface'

const RESET_TTL_MINUTES = 30

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectPinoLogger(PasswordResetService.name)
    private readonly logger: PinoLogger,
    private readonly authRepo: AuthRepository,
    private readonly resetRepo: PasswordResetRepository,
    private readonly session: SessionRepository,
    private readonly password: PasswordService,
    private readonly token: TokenService,
    private readonly audit: AuditLogService,
    private readonly resend: ResendService,
    private readonly config: ConfigService,
  ) {}

  // ─── Step 1: request reset ────────────────────────────────────────────────

  async forgotPassword(email: string, tenantCtx: TenantContext, meta?: RequestMeta): Promise<void> {
    const { schemaName } = tenantCtx
    const user = await this.authRepo.findUserByEmail(schemaName, email)

    if (!user?.is_active) return

    const rawToken = this.token.generateRefreshToken()
    const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000)

    await this.resetRepo.create(schemaName, {
      userId: user.id,
      tokenHash: this.token.hashToken(rawToken),
      expiresAt,
    })
    await this.resend.sendPasswordResetEmail(email, {
      resetUrl: this.buildResetUrl(rawToken),
      userEmail: email,
      expiresInMinutes: RESET_TTL_MINUTES,
    })
    await this.audit.authPasswordResetRequested(email, schemaName, meta)

    this.logger.info({ email, schemaName }, 'Password reset email sent')
  }

  // ─── Step 2: confirm reset ────────────────────────────────────────────────

  async resetPassword(
    rawToken: string,
    newPassword: string,
    tenantCtx: TenantContext,
    meta?: RequestMeta,
  ): Promise<void> {
    const { schemaName } = tenantCtx

    const row = await this.findValidToken(schemaName, rawToken)
    const user = await this.findActiveUser(schemaName, row.user_id)

    await this.applyPasswordChange(schemaName, user.id, row.id, newPassword)
    await this.session.revokeAllForUser(schemaName, user.id)
    await this.audit.authPasswordChanged({ id: user.id, email: user.email }, schemaName, meta)

    this.logger.info({ userId: user.id, schemaName }, 'Password reset successful')
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private async findValidToken(schemaName: string, rawToken: string): Promise<PasswordResetRow> {
    const row = await this.resetRepo.findByTokenHash(schemaName, this.token.hashToken(rawToken))
    if (!row) throw new NotFoundException('Reset token not found or already used')
    if (row.used_at) throw new BadRequestException('Reset token has already been used')
    if (new Date(row.expires_at) < new Date())
      throw new BadRequestException('Reset token has expired')
    return row
  }

  private async findActiveUser(schemaName: string, userId: string): Promise<UserRow> {
    const user = await this.authRepo.findUserById(schemaName, userId)
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  private async applyPasswordChange(
    schemaName: string,
    userId: string,
    tokenId: string,
    newPassword: string,
  ): Promise<void> {
    const passwordHash = await this.password.hash(newPassword)
    await this.authRepo.updatePassword(schemaName, userId, passwordHash)
    await this.resetRepo.markUsed(schemaName, tokenId)
  }

  private buildResetUrl(rawToken: string): string {
    const frontendUrl = this.config.get<string>('app.frontendUrl', 'http://localhost:3001')
    return `${frontendUrl}/reset-password?token=${rawToken}`
  }
}
