import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TenantConfigService } from '../services/tenant-config.service'
import { UpdateNomenclatureDto } from '../dto/nomenclature.dto'
import type { TenantNomenclature } from '../interfaces/nomenclature.interface'

@ApiTags('Settings – Nomenclature')
@Controller('settings/nomenclature')
export class NomenclatureController {
  constructor(private readonly configService: TenantConfigService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Get entity nomenclature labels' })
  getNomenclature(@TenantCtx() ctx: TenantContext): Promise<TenantNomenclature> {
    return this.configService.getNomenclature(ctx.tenantId)
  }

  @Patch()
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update entity nomenclature labels (deep-merges)' })
  @ApiOkResponse({ description: 'Updated nomenclature' })
  updateNomenclature(
    @Body() dto: UpdateNomenclatureDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<TenantNomenclature> {
    return this.configService.updateNomenclature(ctx.tenantId, dto, ctx.slug)
  }
}
