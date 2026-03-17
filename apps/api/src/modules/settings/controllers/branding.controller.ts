import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext, AuthenticatedUser } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { S3Service } from '@/shared/integrations/aws/s3.service'
import { S3Category } from '@/shared/integrations/aws/s3.types'
import { TenantConfigService } from '../services/tenant-config.service'
import type { MulterFile, UploadResult } from '@/shared/integrations/aws/s3.types'

@ApiTags('Settings / Branding')
@Controller('settings/branding')
export class BrandingController {
  constructor(
    private readonly s3: S3Service,
    private readonly configService: TenantConfigService,
  ) {}

  // ─── Logo ─────────────────────────────────────────────────────────────────

  @Post('logo')
  @Auth(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload tenant logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  async uploadLogo(
    @UploadedFile() file: MulterFile,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UploadResult> {
    const result = await this.s3.upload(file, S3Category.TENANT_LOGO, ctx.slug)
    await this.patchBranding(ctx, { logoUrl: result.url }, user.id)
    return result
  }

  // ─── Favicon ──────────────────────────────────────────────────────────────

  @Post('favicon')
  @Auth(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload tenant favicon' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  async uploadFavicon(
    @UploadedFile() file: MulterFile,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UploadResult> {
    const result = await this.s3.upload(file, S3Category.TENANT_FAVICON, ctx.slug)
    await this.patchBranding(ctx, { faviconUrl: result.url }, user.id)
    return result
  }

  // ─── Login background ─────────────────────────────────────────────────────

  @Post('login-bg')
  @Auth(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload login page background image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  async uploadLoginBg(
    @UploadedFile() file: MulterFile,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UploadResult> {
    const result = await this.s3.upload(file, S3Category.TENANT_LOGIN_BG, ctx.slug)
    await this.patchBranding(ctx, { loginBgUrl: result.url }, user.id)
    return result
  }

  // ─── Delete old file when replacing ──────────────────────────────────────

  private async patchBranding(
    ctx: TenantContext,
    patch: Partial<{ logoUrl: string; faviconUrl: string; loginBgUrl: string }>,
    changedBy: string,
  ): Promise<void> {
    const current = await this.configService.getTheme(ctx.tenantId)

    // Delete old file from S3 before replacing
    let oldUrl: string | null = null
    if (patch.logoUrl) oldUrl = current.branding.logoUrl
    else if (patch.faviconUrl) oldUrl = current.branding.faviconUrl
    else oldUrl = current.branding.loginBgUrl

    if (oldUrl) {
      await this.s3.delete(this.s3.extractKey(oldUrl)).catch(() => undefined)
    }

    await this.configService.updateTheme(ctx.tenantId, { branding: patch }, changedBy, ctx.slug)
  }
}
