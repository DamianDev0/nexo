import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext, AuthenticatedUser, ContactWorkspace } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { ContactWorkspaceService } from '../services/contact-workspace.service'
import { UpdateContactWorkspaceDto } from '../dto/contact-workspace.dto'

@ApiTags('Contact Workspace')
@Controller('contacts/workspace')
export class ContactWorkspaceController {
  constructor(private readonly workspace: ContactWorkspaceService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Bootstrap payload for the contacts workspace' })
  getWorkspace(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContactWorkspace> {
    return this.workspace.getWorkspace(ctx.schemaName, user.id)
  }

  @Patch()
  @Auth(UserRole.VIEWER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Persist the current workspace state for the user' })
  updateState(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateContactWorkspaceDto,
  ): Promise<void> {
    return this.workspace.updateState(ctx.schemaName, user.id, dto)
  }
}
