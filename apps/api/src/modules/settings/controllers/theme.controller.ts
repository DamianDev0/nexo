import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Query,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext, AuthenticatedUser } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TenantConfigService } from '../services/tenant-config.service'
import { UpdateThemeDto } from '../dto/theme.dto'
import type { TenantTheme } from '../interfaces/tenant-theme.interface'
import type { TenantThemeHistory } from '../entities/tenant-theme-history.entity'

@ApiTags('Settings – Theme')
@Controller('settings/theme')
export class ThemeController {
  constructor(private readonly configService: TenantConfigService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Get current theme' })
  getTheme(@TenantCtx() ctx: TenantContext): Promise<TenantTheme> {
    return this.configService.getTheme(ctx.tenantId)
  }

  @Patch()
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update theme (deep-merges)' })
  @ApiOkResponse({ description: 'Updated theme' })
  updateTheme(
    @Body() dto: UpdateThemeDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TenantTheme> {
    return this.configService.updateTheme(
      ctx.tenantId,
      dto as Partial<TenantTheme>,
      user.id,
      ctx.slug,
    )
  }

  @Get('history')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get theme change history (last 10)' })
  getHistory(
    @TenantCtx() ctx: TenantContext,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<TenantThemeHistory[]> {
    return this.configService.getThemeHistory(ctx.tenantId, limit)
  }

  @Post('restore/:historyId')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore theme to a previous version' })
  restoreTheme(
    @Param('historyId') historyId: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TenantTheme> {
    return this.configService.restoreTheme(historyId, ctx.tenantId, user.id, ctx.slug)
  }
}
