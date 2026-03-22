import { Body, Controller, Post, Req, Res, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import type { TenantContext, AuthenticatedUser } from '@repo/shared-types'
import { UserRole } from '@repo/shared-types'
import { Public } from '@/shared/decorators/public.decorator'
import { Auth } from '@/shared/decorators/auth.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { extractMeta, setAuthCookies } from '@/modules/auth/utils/auth-request.util'
import { AuthService } from '@/modules/auth/services/auth.service'
import type { LoginSessionDto } from '@/modules/auth/dto/auth-session.dto'
import { UsersService } from '../services/users.service'
import { InviteUserDto, InviteUserResponseDto } from '../dto/invite-user.dto'
import { AcceptInviteDto } from '../dto/accept-invite.dto'

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // ─── Invite a team member ─────────────────────────────────────────────────

  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  @Auth(UserRole.MANAGER)
  @ApiCreatedResponse({ type: InviteUserResponseDto })
  @ApiOperation({
    summary: 'Invite a team member',
    description:
      'MANAGER or above can invite new users. Returns the raw invite token (in production ' +
      'this would be emailed). Token expires in 72 hours.',
  })
  invite(
    @Body() dto: InviteUserDto,
    @TenantCtx() tenantCtx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<InviteUserResponseDto> {
    return this.usersService.invite(dto, tenantCtx, user.id, user.email, extractMeta(req))
  }

  // ─── Accept invitation ────────────────────────────────────────────────────

  @Public()
  @Post('invite/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Session created — auth cookies set' })
  @ApiOperation({
    summary: 'Accept an invitation and create your account',
    description:
      'Validates the invite token, creates the account, and returns an authenticated session.',
  })
  async acceptInvite(
    @Body() dto: AcceptInviteDto,
    @TenantCtx() tenantCtx: TenantContext,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginSessionDto> {
    const meta = extractMeta(req)
    const user = await this.usersService.acceptInvite(dto, tenantCtx, meta)
    const result = await this.authService.login(user, tenantCtx, meta)
    setAuthCookies(res, result.accessToken, result.refreshToken, req)
    return { user: result.user }
  }
}
