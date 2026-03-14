import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import type { Request, Response } from 'express'
import type { TenantContext, AuthenticatedUser } from '@repo/shared-types'
import { Public } from '@/shared/decorators/public.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { LocalAuthGuard } from '../guards/local-auth.guard'
import { AuthService } from '../services/auth.service'
import type { UserRow } from '../interfaces/auth-rows.interface'
import { OnboardingDto } from '../dto/onboarding.dto'
import { LoginSessionDto, OnboardingSessionDto } from '../dto/auth-session.dto'
import { REFRESH_COOKIE } from '../constants/auth-cookies.constants'
import { extractMeta, setAuthCookies, clearAuthCookies } from '../utils/auth-request.util'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Onboard (create tenant + owner — public, main domain only) ─────────
  //
  // Single entry point for new customers. After this call the frontend
  // should redirect to `https://{tenant.slug}.nexocrm.com`.
  // Tokens are delivered via httpOnly cookies — NOT returned in the body.

  @Public()
  @Post('onboard')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: OnboardingSessionDto })
  @ApiOperation({
    summary: 'Create a new tenant and register its owner in one atomic step',
    description:
      'Called from the public sign-up page. Creates the business account, provisions the ' +
      'isolated schema, and registers the first user as OWNER. All other team members ' +
      'join via invitation — there is no public registration endpoint. ' +
      'Auth tokens are set as httpOnly cookies and are NOT in the response body.',
  })
  async onboard(
    @Body() dto: OnboardingDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<OnboardingSessionDto> {
    const result = await this.authService.onboard(dto, extractMeta(req))
    setAuthCookies(res, result.accessToken, result.refreshToken, req)
    return { user: result.user, tenant: result.tenant }
  }

  // ─── Login ───────────────────────────────────────────────────────────────

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginSessionDto })
  @ApiOperation({
    summary: 'Login with email and password',
    description: 'Auth tokens are set as httpOnly cookies and are NOT in the response body.',
  })
  async login(
    @Req() req: Request & { user: UserRow; tenantContext: TenantContext },
    @TenantCtx() tenantCtx: TenantContext,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginSessionDto> {
    const result = await this.authService.login(req.user, tenantCtx, extractMeta(req))
    setAuthCookies(res, result.accessToken, result.refreshToken, req)
    return { user: result.user }
  }

  // ─── Refresh ─────────────────────────────────────────────────────────────

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiOkResponse({ type: LoginSessionDto })
  @ApiOperation({
    summary: 'Rotate tokens using the refresh_token cookie',
    description:
      'Issues a new token pair. Includes reuse detection — if the refresh token ' +
      'was already consumed, all sessions for the user are invalidated.',
  })
  async refresh(
    @Req() req: Request,
    @TenantCtx() tenantCtx: TenantContext,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginSessionDto> {
    const cookies = req.cookies as Record<string, string> | undefined
    const rawToken = cookies?.[REFRESH_COOKIE]
    if (!rawToken) throw new UnauthorizedException('Refresh token missing')

    const result = await this.authService.refresh(rawToken, tenantCtx, extractMeta(req))
    setAuthCookies(res, result.accessToken, result.refreshToken, req)
    return { user: result.user }
  }

  // ─── Logout ──────────────────────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke the current refresh token and clear auth cookies' })
  async logout(
    @Req() req: Request,
    @TenantCtx() tenantCtx: TenantContext,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const cookies = req.cookies as Record<string, string> | undefined
    const rawToken = cookies?.[REFRESH_COOKIE]
    if (rawToken) {
      await this.authService.logout(rawToken, tenantCtx.schemaName)
    }
    clearAuthCookies(res)
  }

  // ─── Me ──────────────────────────────────────────────────────────────────

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user (decoded from JWT cookie)' })
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user
  }
}
