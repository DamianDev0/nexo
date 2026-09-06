import { Body, Controller, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { AuthenticatedUser, ContactConsent, TenantContext } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { UpsertContactConsentDto } from '../dto/contact-consent.dto'
import { ContactConsentsService } from '../services/contact-consents.service'

@ApiTags('Contacts')
@Controller('contacts/:id/consents')
export class ContactConsentsController {
  constructor(private readonly consents: ContactConsentsService) {}

  @Get()
  @ApiEndpoint({
    summary: 'Consent state per channel for a contact',
    roles: [UserRole.VIEWER],
    param: 'Contact UUID',
  })
  list(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ContactConsent[]> {
    return this.consents.list(ctx.schemaName, id)
  }

  @Put()
  @ApiEndpoint({
    summary: 'Grant or revoke consent for one channel, keeping evidence',
    roles: [UserRole.SALES_REP],
    param: 'Contact UUID',
  })
  upsert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertContactConsentDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContactConsent> {
    return this.consents.upsert(ctx.schemaName, id, dto, user.id)
  }
}
