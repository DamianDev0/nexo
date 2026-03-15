import { Injectable } from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { AuditAction, AuditEntityType } from './audit-log.interfaces'
import type { AuditEvent, AuditMeta, UserRef, TenantRef } from './audit-log.interfaces'

@Injectable()
export class AuditLogService {
  constructor(
    @InjectPinoLogger(AuditLogService.name)
    private readonly logger: PinoLogger,
    private readonly tenantDb: TenantDbService,
  ) {}

  // ─── Auth events ──────────────────────────────────────────────────────────

  async authLogin(user: UserRef, schemaName: string, meta?: AuditMeta): Promise<void> {
    await this.write({
      schemaName,
      action: AuditAction.AuthLogin,
      entityType: AuditEntityType.User,
      entityId: user.id,
      userId: user.id,
      severity: 'info',
      description: `User ${user.email} logged in`,
      ...meta,
    })
  }

  async authLoginFailed(
    email: string,
    reason: 'user_not_found' | 'invalid_password',
    schemaName: string,
    meta?: AuditMeta,
    userId?: string,
  ): Promise<void> {
    const label = reason === 'user_not_found' ? 'user not found' : 'invalid password'
    await this.write({
      schemaName,
      action: AuditAction.AuthLoginFailed,
      entityType: AuditEntityType.User,
      entityId: userId,
      userId,
      severity: 'warning',
      description: `Failed login attempt for ${email} — ${label}`,
      metadata: { email, reason },
      ...meta,
    })
  }

  async authLoginGoogle(user: UserRef, schemaName: string, meta?: AuditMeta): Promise<void> {
    await this.write({
      schemaName,
      action: AuditAction.AuthLoginGoogle,
      entityType: AuditEntityType.User,
      entityId: user.id,
      userId: user.id,
      severity: 'info',
      description: `User ${user.email} logged in via Google OAuth`,
      ...meta,
    })
  }

  async authLogout(schemaName: string, meta?: AuditMeta): Promise<void> {
    await this.write({
      schemaName,
      action: AuditAction.AuthLogout,
      entityType: AuditEntityType.User,
      severity: 'info',
      description: 'User logged out',
      ...meta,
    })
  }

  async authTokenRefreshed(user: UserRef, schemaName: string, meta?: AuditMeta): Promise<void> {
    await this.write({
      schemaName,
      action: AuditAction.AuthTokenRefreshed,
      entityType: AuditEntityType.User,
      entityId: user.id,
      userId: user.id,
      severity: 'info',
      description: `Session token rotated for user ${user.email}`,
      ...meta,
    })
  }

  async authSessionsRevoked(userId: string, schemaName: string, meta?: AuditMeta): Promise<void> {
    await this.write({
      schemaName,
      action: AuditAction.AuthSessionsRevoked,
      entityType: AuditEntityType.User,
      entityId: userId,
      userId,
      severity: 'critical',
      description: 'Refresh token reuse detected — all sessions invalidated',
      metadata: { reason: 'token_reuse' },
      ...meta,
    })
  }

  async authInviteSent(
    email: string,
    role: string,
    invitedById: string,
    schemaName: string,
    meta?: AuditMeta,
  ): Promise<void> {
    await this.write({
      schemaName,
      action: AuditAction.AuthInviteSent,
      entityType: AuditEntityType.User,
      userId: invitedById,
      severity: 'info',
      description: `Invitation sent to ${email} with role "${role}"`,
      metadata: { email, role },
      ...meta,
    })
  }

  async authInviteAccepted(
    user: UserRef,
    role: string,
    schemaName: string,
    meta?: AuditMeta,
  ): Promise<void> {
    await this.write({
      schemaName,
      action: AuditAction.AuthInviteAccepted,
      entityType: AuditEntityType.User,
      entityId: user.id,
      userId: user.id,
      severity: 'info',
      description: `${user.email} accepted their invitation`,
      metadata: { email: user.email, role },
      ...meta,
    })
  }

  async authPasswordResetRequested(
    email: string,
    schemaName: string,
    meta?: AuditMeta,
  ): Promise<void> {
    await this.write({
      schemaName,
      action: AuditAction.AuthPasswordResetRequested,
      entityType: AuditEntityType.User,
      severity: 'info',
      description: `Password reset requested for ${email}`,
      metadata: { email },
      ...meta,
    })
  }

  async authPasswordChanged(user: UserRef, schemaName: string, meta?: AuditMeta): Promise<void> {
    await this.write({
      schemaName,
      action: AuditAction.AuthPasswordChanged,
      entityType: AuditEntityType.User,
      entityId: user.id,
      userId: user.id,
      severity: 'info',
      description: `Password changed for user ${user.email}`,
      ...meta,
    })
  }

  // ─── User events ──────────────────────────────────────────────────────────

  async userCreated(
    user: UserRef,
    role: string,
    schemaName: string,
    meta?: AuditMeta,
  ): Promise<void> {
    await this.write({
      schemaName,
      action: AuditAction.UserCreated,
      entityType: AuditEntityType.User,
      entityId: user.id,
      userId: user.id,
      severity: 'info',
      description: `User ${user.email} created`,
      metadata: { email: user.email, role },
      ...meta,
    })
  }

  // ─── Settings events ──────────────────────────────────────────────────────

  async settingsUpdated(
    tenantId: string,
    userId: string | undefined,
    schemaName: string,
    meta?: AuditMeta,
    description = 'Tenant settings updated',
  ): Promise<void> {
    await this.write({
      schemaName,
      action: AuditAction.SettingsUpdated,
      entityType: AuditEntityType.System,
      entityId: tenantId,
      userId,
      severity: 'info',
      description,
      ...meta,
    })
  }

  // ─── Tenant events ────────────────────────────────────────────────────────

  async tenantCreated(tenant: TenantRef, schemaName: string, meta?: AuditMeta): Promise<void> {
    await this.write({
      schemaName,
      action: AuditAction.TenantCreated,
      entityType: AuditEntityType.System,
      entityId: tenant.id,
      severity: 'info',
      description: `Tenant "${tenant.name}" created with slug "${tenant.slug}"`,
      metadata: { slug: tenant.slug, plan: tenant.plan },
      ...meta,
    })
  }

  // ─── Private write ────────────────────────────────────────────────────────

  private async write(event: AuditEvent): Promise<void> {
    const {
      schemaName,
      action,
      entityType,
      entityId = null,
      userId = null,
      ip = null,
      userAgent = null,
      severity = 'info',
      description = null,
      metadata = null,
      oldValue = null,
      newValue = null,
    } = event

    try {
      await this.tenantDb.query(schemaName, async (qr) => {
        await qr.query(
          `INSERT INTO "${schemaName}".audit_log
             (action, entity_type, entity_id, user_id, ip_address, user_agent,
              severity, description, metadata, old_value, new_value)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            action,
            entityType,
            entityId,
            userId,
            ip,
            userAgent,
            severity,
            description,
            metadata ? JSON.stringify(metadata) : null,
            oldValue ? JSON.stringify(oldValue) : null,
            newValue ? JSON.stringify(newValue) : null,
          ],
        )
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.error({ error: message, action, schemaName }, 'Audit log write failed')
    }
  }
}
