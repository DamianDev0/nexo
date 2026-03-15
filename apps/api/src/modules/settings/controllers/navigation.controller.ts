import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TenantConfigService } from '../services/tenant-config.service'
import { UpdateSidebarDto } from '../dto/sidebar.dto'
import type { SidebarConfig } from '../interfaces/sidebar-config.interface'

@ApiTags('Settings – Navigation')
@Controller('settings/navigation')
export class NavigationController {
  constructor(private readonly configService: TenantConfigService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Get sidebar navigation config' })
  getSidebar(@TenantCtx() ctx: TenantContext): Promise<SidebarConfig> {
    return this.configService.getSidebarConfig(ctx.tenantId)
  }

  @Patch()
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update sidebar navigation config',
    description: 'Required modules (dashboard, settings) cannot be disabled.',
  })
  @ApiOkResponse({ description: 'Updated sidebar config' })
  updateSidebar(
    @Body() dto: UpdateSidebarDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<SidebarConfig> {
    return this.configService.updateSidebarConfig(ctx.tenantId, dto, ctx.slug)
  }
}
