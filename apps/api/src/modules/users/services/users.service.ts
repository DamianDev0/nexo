import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import type { TenantContext } from '@repo/shared-types'
import { AuditLogService } from '@/shared/audit-log/audit-log.service'
import { PasswordService } from '@/shared/security/password.service'
import { ResendService } from '@/shared/integrations/resend/resend.service'
import { AuthRepository } from '@/modules/auth/repositories/auth.repository'
import { TokenService } from '@/modules/auth/services/token.service'
import { InvitationRepository } from '../repositories/invitation.repository'
import type { InviteUserDto, InviteUserResponseDto } from '../dto/invite-user.dto'
import type { AcceptInviteDto } from '../dto/accept-invite.dto'
import type { UserRow, RequestMeta } from '@/modules/auth/interfaces/auth-rows.interface'

const INVITE_TTL_HOURS = 72

@Injectable()
export class UsersService {
  constructor(
    @InjectPinoLogger(UsersService.name)
    private readonly logger: PinoLogger,
    private readonly invitationRepo: InvitationRepository,
    private readonly authRepo: AuthRepository,
    private readonly password: PasswordService,
    private readonly token: TokenService,
    private readonly audit: AuditLogService,
    private readonly resend: ResendService,
    private readonly config: ConfigService,
  ) {}

  // ─── Send invitation ───────────────────────────────────────────────────────

  async invite(
    dto: InviteUserDto,
    tenantCtx: TenantContext,
    invitedById: string,
    inviterEmail: string,
    meta?: RequestMeta,
  ): Promise<InviteUserResponseDto> {
    const { schemaName } = tenantCtx

    const existing = await this.authRepo.findUserByEmail(schemaName, dto.email)
    if (existing) {
      throw new ConflictException(`A user with email ${dto.email} already exists in this account`)
    }

    // Replace any previous pending invite for the same email (re-invite flow)
    await this.invitationRepo.deleteByEmail(schemaName, dto.email)

    const rawToken = this.token.generateRefreshToken()
    const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000)

    await this.invitationRepo.create(schemaName, {
      email: dto.email,
      role: dto.role,
      tokenHash: this.token.hashToken(rawToken),
      invitedBy: invitedById,
      expiresAt,
    })

    const frontendUrl = this.config.get<string>('app.frontendUrl', 'http://localhost:3001')
    const inviteUrl = `${frontendUrl}/invite/accept?token=${rawToken}`

    await this.resend.sendInviteEmail(dto.email, {
      inviteUrl,
      tenantName: schemaName,
      inviterName: inviterEmail,
      role: dto.role,
      expiresInHours: INVITE_TTL_HOURS,
    })

    this.logger.info({ email: dto.email, role: dto.role, schemaName }, 'Invitation sent')
    await this.audit.authInviteSent(dto.email, dto.role, invitedById, schemaName, meta)

    return { inviteToken: rawToken, email: dto.email, expiresAt: expiresAt.toISOString() }
  }

  // ─── Accept invitation ─────────────────────────────────────────────────────

  async acceptInvite(
    dto: AcceptInviteDto,
    schemaName: string,
    meta?: RequestMeta,
  ): Promise<UserRow> {
    const invitation = await this.invitationRepo.findByTokenHash(
      schemaName,
      this.token.hashToken(dto.token),
    )

    if (!invitation) throw new NotFoundException('Invitation not found or already used')
    if (invitation.accepted_at)
      throw new BadRequestException('Invitation has already been accepted')
    if (new Date(invitation.expires_at) < new Date())
      throw new BadRequestException('Invitation has expired')

    const existing = await this.authRepo.findUserByEmail(schemaName, invitation.email)
    if (existing) throw new ConflictException('An account with this email already exists')

    const passwordHash = await this.password.hash(dto.password)
    const user = await this.authRepo.createInvitedUser(
      schemaName,
      invitation.email,
      passwordHash,
      dto.fullName,
      invitation.role,
    )

    await this.invitationRepo.markAccepted(schemaName, invitation.id)
    this.logger.info(
      { email: invitation.email, role: invitation.role, schemaName },
      'Invite accepted',
    )

    await this.audit.authInviteAccepted(
      { id: user.id, email: user.email },
      invitation.role,
      schemaName,
      meta,
    )
    await this.audit.userCreated(
      { id: user.id, email: user.email },
      invitation.role,
      schemaName,
      meta,
    )

    return user
  }
}
