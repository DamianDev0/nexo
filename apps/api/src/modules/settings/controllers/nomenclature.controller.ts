import { Body, Controller, Get, HttpStatus, Patch } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TenantConfigService } from '../services/tenant-config.service'
import { UpdateNomenclatureDto } from '../dto/nomenclature.dto'
import type { TenantNomenclature } from '../interfaces/nomenclature.interface'

@ApiTags('Settings – Nomenclature')
@Controller('settings/nomenclature')
export class NomenclatureController {
  constructor(private readonly configService: TenantConfigService) {}

  @Get()
  @ApiEndpoint({ summary: 'Get entity nomenclature labels', roles: [UserRole.VIEWER] })
  getNomenclature(@TenantCtx() ctx: TenantContext): Promise<TenantNomenclature> {
    return this.configService.getNomenclature(ctx.tenantId)
  }

  @Patch()
  @ApiEndpoint({
    summary: 'Update entity nomenclature labels (deep-merges)',
    roles: [UserRole.ADMIN],
    status: HttpStatus.OK,
  })
  @ApiOkResponse({ description: 'Updated nomenclature' })
  updateNomenclature(
    @Body() dto: UpdateNomenclatureDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<TenantNomenclature> {
    return this.configService.updateNomenclature(ctx.tenantId, dto, ctx.slug)
  }
}
