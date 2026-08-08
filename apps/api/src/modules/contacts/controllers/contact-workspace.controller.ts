import { Body, Controller, Get, HttpStatus, Patch } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext, AuthenticatedUser, ContactWorkspace } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { ContactWorkspaceService } from '../services/contact-workspace.service'
import { UpdateContactWorkspaceDto } from '../dto/contact-workspace.dto'

@ApiTags('Contact Workspace')
@Controller('contacts/workspace')
export class ContactWorkspaceController {
  constructor(private readonly workspace: ContactWorkspaceService) {}

  @Get()
  @ApiEndpoint({
    summary: 'Bootstrap payload for the contacts workspace',
    roles: [UserRole.VIEWER],
  })
  getWorkspace(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContactWorkspace> {
    return this.workspace.getWorkspace(ctx.schemaName, user.id)
  }

  @Patch()
  @ApiEndpoint({
    summary: 'Persist the current workspace state for the user',
    roles: [UserRole.VIEWER],
    status: HttpStatus.NO_CONTENT,
  })
  updateState(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateContactWorkspaceDto,
  ): Promise<void> {
    return this.workspace.updateState(ctx.schemaName, user.id, dto)
  }
}
