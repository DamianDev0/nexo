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
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'
import type { TenantContext, AuthenticatedUser } from '@repo/shared-types'
import { Public } from '@/shared/decorators/public.decorator'
import { Auth } from '@/shared/decorators/auth.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { LocalAuthGuard } from '../guards/local-auth.guard'
import { GoogleAuthGuard, GoogleCallbackGuard } from '../guards/google-auth.guard'
import { AuthService } from '../services/auth.service'
import { PasswordResetService } from '../services/password-reset.service'
import type { UserRow } from '../interfaces/auth-rows.interface'
import type { GoogleProfile } from '../interfaces/google-profile.interface'
import { OnboardingDto } from '../dto/onboarding.dto'
import { LoginSessionDto, OnboardingSessionDto } from '../dto/auth-session.dto'
import { ForgotPasswordDto, ResetPasswordDto } from '../dto/password-reset.dto'
import { REFRESH_COOKIE } from '../constants/auth-cookies.constants'
import {
  extractMeta,
  setAuthCookies,
  clearAuthCookies,
  extractCookie,
} from '../utils/auth-request.util'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly config: ConfigService,
  ) {}

  // ─── Onboard ─────────────────────────────────────────────────────────────

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

  // ─── Google OAuth ─────────────────────────────────────────────────────────

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({
    summary: 'Initiate Google OAuth flow',
    description:
      'Redirects to Google. Pass ?slug=your-tenant-slug so the backend knows which tenant ' +
      'to authenticate against. Example: GET /auth/google?slug=damian-tech',
  })
  googleLogin(): void {
    // Passport handles the redirect — this body never executes
  }

  @Public()
  @UseGuards(GoogleCallbackGuard)
  @Get('google/callback')
  @ApiExcludeEndpoint() // Internal redirect — not useful in Swagger
  async googleCallback(
    @Req() req: Request & { user: GoogleProfile },
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.authService.validateGoogleUser(req.user, extractMeta(req))
    setAuthCookies(res, result.accessToken, result.refreshToken, req)

    const frontendUrl = this.config.get<string>('app.frontendUrl') ?? 'http://localhost:3001'
    res.redirect(`${frontendUrl}/dashboard`)
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
    const rawToken = extractCookie(req, REFRESH_COOKIE)
    if (!rawToken) throw new UnauthorizedException('Refresh token missing')

    const result = await this.authService.refresh(rawToken, tenantCtx, extractMeta(req))
    setAuthCookies(res, result.accessToken, result.refreshToken, req)
    return { user: result.user }
  }

  // ─── Logout ──────────────────────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  @ApiOperation({ summary: 'Revoke the current refresh token and clear auth cookies' })
  async logout(
    @Req() req: Request,
    @TenantCtx() tenantCtx: TenantContext,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const rawToken = extractCookie(req, REFRESH_COOKIE)
    if (rawToken) {
      await this.authService.logout(rawToken, tenantCtx.schemaName, extractMeta(req))
    }
    clearAuthCookies(res)
  }

  // ─── Forgot password ──────────────────────────────────────────────────────

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Request a password reset email',
    description:
      'Always returns 204 regardless of whether the email exists — prevents user enumeration. ' +
      'The reset link expires in 30 minutes.',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @TenantCtx() tenantCtx: TenantContext,
    @Req() req: Request,
  ): Promise<void> {
    await this.passwordResetService.forgotPassword(dto.email, tenantCtx, extractMeta(req))
  }

  // ─── Reset password ───────────────────────────────────────────────────────

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Set a new password using the token from the reset email',
    description: 'Consumes the token (single-use) and revokes all active sessions.',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @TenantCtx() tenantCtx: TenantContext,
    @Req() req: Request,
  ): Promise<void> {
    await this.passwordResetService.resetPassword(
      dto.token,
      dto.newPassword,
      tenantCtx,
      extractMeta(req),
    )
  }

  // ─── Me ──────────────────────────────────────────────────────────────────

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Get the currently authenticated user (decoded from JWT cookie)' })
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user
  }
}
