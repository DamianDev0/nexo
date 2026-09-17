import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { activeFieldDefs, UserRole } from '@repo/shared-types'
import type { TenantContext, AuthenticatedUser, ContactWorkspace } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { ObjectWorkspaceController } from '@/shared/object-engine/controllers/object-workspace.controller'
import { ObjectWorkspaceService } from '@/shared/object-engine/services/object-workspace.service'
import { TenantConfigService } from '@/modules/settings/services/tenant-config.service'
import { CONTACT_OBJECT } from '../constants/contact-object.definition'
import { ContactWorkspaceService } from '../services/contact-workspace.service'

@ApiTags('Contact Workspace')
@Controller('contacts/workspace')
export class ContactWorkspaceController extends ObjectWorkspaceController {
  protected readonly definition = CONTACT_OBJECT

  constructor(
    workspace: ObjectWorkspaceService,
    private readonly contactWorkspace: ContactWorkspaceService,
    private readonly tenantConfig: TenantConfigService,
  ) {
    super(workspace)
  }

  @Get()
  @ApiEndpoint({
    summary: 'Bootstrap payload for the contacts workspace',
    roles: [UserRole.VIEWER],
  })
  async getWorkspace(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContactWorkspace> {
    const [taxonomy, customFields] = await Promise.all([
      this.tenantConfig.getContactTaxonomy(ctx.tenantId),
      this.tenantConfig.getCustomFields(ctx.tenantId),
    ])
    return this.contactWorkspace.getWorkspace(
      ctx.schemaName,
      user.id,
      taxonomy,
      activeFieldDefs(customFields.contacts),
    )
  }
}
