import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { BulkActionRequest, BulkActionResult, TenantContext } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { BulkActionsService } from './bulk-actions.service'

@ApiTags('Bulk Actions')
@Controller('bulk')
export class BulkActionsController {
  constructor(private readonly service: BulkActionsService) {}

  @Post(':entity')
  @Auth(UserRole.MANAGER)
  @ApiOperation({ summary: 'Execute a bulk action on contacts, companies, or deals' })
  async execute(
    @Body() dto: BulkActionRequest & { entity: string },
    @TenantCtx() ctx: TenantContext,
  ): Promise<BulkActionResult> {
    switch (dto.action) {
      case 'assign':
        return this.service.assign(
          ctx.schemaName,
          dto.entity,
          dto.ids,
          dto.params['assignedToId'] as string,
        )
      case 'tag':
        return this.service.tag(ctx.schemaName, dto.entity, dto.ids, dto.params['tags'] as string[])
      case 'untag':
        return this.service.untag(
          ctx.schemaName,
          dto.entity,
          dto.ids,
          dto.params['tags'] as string[],
        )
      case 'delete':
        return this.service.softDelete(ctx.schemaName, dto.entity, dto.ids)
      default:
        return {
          processed: 0,
          failed: 0,
          errors: [{ id: '', message: `Unknown action: ${dto.action as string}` }],
        }
    }
  }
}
