import {
  Body,
  Controller,
  Get,
  Header,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Query,
  Res,
} from '@nestjs/common'
import { ApiOkResponse, ApiProduces, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { UserRole } from '@repo/shared-types'
import type { TenantContext, AuthenticatedUser } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
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
  @ApiEndpoint({ summary: 'Get current theme', roles: [UserRole.VIEWER] })
  getTheme(@TenantCtx() ctx: TenantContext): Promise<TenantTheme> {
    return this.configService.getTheme(ctx.tenantId)
  }

  @Patch()
  @ApiEndpoint({
    summary: 'Update theme (deep-merges)',
    roles: [UserRole.ADMIN],
    status: HttpStatus.OK,
  })
  @ApiOkResponse({ description: 'Updated theme' })
  updateTheme(
    @Body() dto: UpdateThemeDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TenantTheme> {
    return this.configService.updateTheme(ctx.tenantId, dto, user.id, ctx.slug)
  }

  @Post('import')
  @ApiEndpoint({
    summary: 'Import a theme from a shadcn CSS-vars block or DTCG JSON',
    roles: [UserRole.ADMIN],
    status: HttpStatus.OK,
  })
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
  @ApiEndpoint({
    summary: 'Export the resolved theme as shadcn CSS variables or DTCG JSON',
    roles: [UserRole.ADMIN],
  })
  @Header('Cache-Control', 'no-store')
  @ApiProduces('text/css', 'application/json')
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
  @ApiEndpoint({ summary: 'Get theme change history (last 10)', roles: [UserRole.ADMIN] })
  getHistory(
    @TenantCtx() ctx: TenantContext,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<TenantThemeHistory[]> {
    return this.configService.getThemeHistory(ctx.tenantId, limit)
  }

  @Post('restore/:historyId')
  @ApiEndpoint({
    summary: 'Restore theme to a previous version',
    roles: [UserRole.ADMIN],
    status: HttpStatus.OK,
  })
  restoreTheme(
    @Param('historyId') historyId: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TenantTheme> {
    return this.configService.restoreTheme(historyId, ctx.tenantId, user.id, ctx.slug)
  }
}
