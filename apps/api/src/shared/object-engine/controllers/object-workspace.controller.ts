import { Body, HttpStatus, Patch } from '@nestjs/common'
import { UserRole } from '@repo/shared-types'
import type { AuthenticatedUser, TenantContext } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { UpdateObjectWorkspaceDto } from '../dto/object-workspace.dto'
import type { ObjectTableDefinition } from '../interfaces/object-definition.interfaces'
import { ObjectWorkspaceService } from '../services/object-workspace.service'

export abstract class ObjectWorkspaceController {
  protected abstract readonly definition: ObjectTableDefinition

  constructor(protected readonly workspace: ObjectWorkspaceService) {}

  @Patch()
  @ApiEndpoint({
    summary: 'Persist the current workspace state for the user',
    roles: [UserRole.VIEWER],
    status: HttpStatus.NO_CONTENT,
  })
  updateState(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateObjectWorkspaceDto,
  ): Promise<void> {
    return this.workspace.updateState(ctx.schemaName, this.definition, user.id, dto)
  }
}
