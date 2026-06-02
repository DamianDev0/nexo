import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Query,
  Res,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { UserRole } from '@repo/shared-types'
import type { TenantContext, AuthenticatedUser } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TenantConfigService } from '../services/tenant-config.service'
import { ThemeExportService } from '../services/theme-export.service'
import { ThemeImportService } from '../services/theme-import.service'
import { UpdateThemeDto } from '../dto/theme.dto'
import { ExportThemeQueryDto, ImportThemeDto } from '../dto/import-theme.dto'
import type { TenantTheme } from '../interfaces/tenant-theme.interface'
import type { TenantThemeHistory } from '../entities/tenant-theme-history.entity'

@ApiTags('Settings – Theme')
@Controller('settings/theme')
export class ThemeController {
  constructor(
    private readonly configService: TenantConfigService,
    private readonly exportService: ThemeExportService,
    private readonly importService: ThemeImportService,
  ) {}

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
    return this.configService.updateTheme(ctx.tenantId, dto, user.id, ctx.slug)
  }

  @Post('import')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import a theme from a shadcn CSS-vars block or DTCG JSON' })
  @ApiOkResponse({ description: 'Updated theme' })
  importTheme(
    @Body() dto: ImportThemeDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TenantTheme> {
    const colors = this.importService.parse(dto.source)
    return this.configService.updateTheme(ctx.tenantId, { colors }, user.id, ctx.slug)
  }

  @Get('export')
  @Auth(UserRole.ADMIN)
  @Header('Cache-Control', 'no-store')
  @ApiProduces('text/css', 'application/json')
  @ApiOperation({ summary: 'Export the resolved theme as shadcn CSS variables or DTCG JSON' })
  async exportTheme(
    @TenantCtx() ctx: TenantContext,
    @Query() query: ExportThemeQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const theme = await this.configService.getTheme(ctx.tenantId)
    if (query.format === 'dtcg') {
      res.type('application/json').send(this.exportService.toDtcg(theme))
      return
    }
    res.type('text/css').send(this.exportService.toCss(theme))
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
