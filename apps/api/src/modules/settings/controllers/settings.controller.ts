import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Req } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext, AuthenticatedUser } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { extractMeta } from '@/modules/auth/utils/auth-request.util'

import type { Request } from 'express'
import { SettingsService } from '../services/settings.service'
import { UpdateSettingsDto } from '../dto/update-settings.dto'
import { SettingsResponseDto } from '../dto/settings-response.dto'

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('general')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Get current tenant settings' })
  @ApiOkResponse({ type: SettingsResponseDto })
  getGeneral(@TenantCtx() tenantCtx: TenantContext): Promise<SettingsResponseDto> {
    return this.settingsService.getSettings(tenantCtx.tenantId)
  }

  @Patch('general')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update tenant settings',
    description:
      'Owner can update all fields. Admin can update everything except fiscal (nit, taxRegime) and billing fields.',
  })
  @ApiOkResponse({ type: SettingsResponseDto })
  updateGeneral(
    @Body() dto: UpdateSettingsDto,
    @TenantCtx() tenantCtx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<SettingsResponseDto> {
    return this.settingsService.updateSettings(
      tenantCtx.tenantId,
      dto,
      user.role,
      tenantCtx.schemaName,
      user.id,
      extractMeta(req),
    )
  }
}
