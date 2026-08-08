import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { ContactTaxonomy, TaxonomyOption, TenantContext } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TenantConfigService } from '../services/tenant-config.service'
import { UpdateContactTaxonomyDto } from '../dto/contact-taxonomy.dto'

@ApiTags('Settings – Contact Taxonomy')
@Controller('settings/contact-taxonomy')
export class ContactTaxonomyController {
  constructor(private readonly configService: TenantConfigService) {}

  @Get()
  @ApiEndpoint({
    summary: 'Get the tenant statuses and sources for contacts',
    roles: [UserRole.VIEWER],
  })
  get(@TenantCtx() ctx: TenantContext): Promise<ContactTaxonomy> {
    return this.configService.getContactTaxonomy(ctx.tenantId)
  }

  @Patch()
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Replace the tenant statuses and sources',
    description: 'System options may be relabelled or recoloured, never removed.',
  })
  async update(
    @Body() dto: UpdateContactTaxonomyDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ContactTaxonomy> {
    const current = await this.configService.getContactTaxonomy(ctx.tenantId)
    assertSystemKeysKept(current.statuses, dto.statuses, 'status')
    assertSystemKeysKept(current.sources, dto.sources, 'source')
    assertUniqueKeys(dto.statuses, 'status')
    assertUniqueKeys(dto.sources, 'source')

    return this.configService.updateContactTaxonomy(ctx.tenantId, dto, ctx.slug)
  }
}

function assertSystemKeysKept(
  current: TaxonomyOption[],
  next: TaxonomyOption[],
  label: string,
): void {
  const keys = new Set(next.map((option) => option.key))
  const dropped = current.filter((option) => option.isSystem && !keys.has(option.key))
  if (dropped.length > 0) {
    throw new BadRequestException(
      `System ${label} options cannot be removed: ${dropped.map((o) => o.key).join(', ')}`,
    )
  }
}

function assertUniqueKeys(options: TaxonomyOption[], label: string): void {
  const seen = new Set<string>()
  for (const option of options) {
    if (seen.has(option.key))
      throw new BadRequestException(`Duplicate ${label} key '${option.key}'`)
    seen.add(option.key)
  }
}
