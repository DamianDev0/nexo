import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  TenantContext,
  AuthenticatedUser,
  Contact,
  ContactCounts,
  PaginatedContacts,
  ContactTimeline,
} from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { ContactsService } from '../services/contacts.service'
import { CustomFieldsValidator } from '@/modules/settings/services/custom-fields-validator.service'
import { CreateContactDto, UpdateContactDto, ContactQueryDto } from '../dto/contact.dto'

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly customFields: CustomFieldsValidator,
  ) {}

  @Get()
  @ApiEndpoint({
    summary: 'List contacts with pagination, filters and full-text search',
    roles: [UserRole.VIEWER],
  })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @Query() query: ContactQueryDto,
  ): Promise<PaginatedContacts> {
    return this.contactsService.findAll(ctx.schemaName, query)
  }

  @Post()
  @ApiEndpoint({
    summary: 'Create a contact; pass force=true to override soft duplicates',
    roles: [UserRole.SALES_REP],
  })
  async create(
    @Body() dto: CreateContactDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Query('force', new ParseBoolPipe({ optional: true })) force?: boolean,
  ): Promise<Contact> {
    await this.customFields.validate(ctx.tenantId, 'contacts', dto.customFields)
    return this.contactsService.create(ctx.schemaName, dto, user.id, force ?? false)
  }

  @Get('counts')
  @ApiEndpoint({ summary: 'Contact totals grouped by status', roles: [UserRole.VIEWER] })
  counts(@TenantCtx() ctx: TenantContext): Promise<ContactCounts> {
    return this.contactsService.counts(ctx.schemaName)
  }

  @Get(':id')
  @ApiEndpoint({
    summary: 'Get a single contact',
    roles: [UserRole.VIEWER],
    param: 'Contact UUID',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Contact> {
    return this.contactsService.findOne(ctx.schemaName, id)
  }

  @Patch(':id')
  @ApiEndpoint({ summary: 'Update a contact', roles: [UserRole.SALES_REP], param: 'Contact UUID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
    @TenantCtx() ctx: TenantContext,
    @Query('force', new ParseBoolPipe({ optional: true })) force?: boolean,
  ): Promise<Contact> {
    await this.customFields.validate(ctx.tenantId, 'contacts', dto.customFields)
    return this.contactsService.update(ctx.schemaName, id, dto, force ?? false)
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Soft-delete a contact',
    roles: [UserRole.MANAGER],
    param: 'Contact UUID',
    status: HttpStatus.NO_CONTENT,
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.contactsService.remove(ctx.schemaName, id)
  }

  @Get(':id/timeline')
  @ApiEndpoint({
    summary: 'Get contact timeline (activities + deals)',
    roles: [UserRole.VIEWER],
    param: 'Contact UUID',
  })
  getTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ContactTimeline> {
    return this.contactsService.getTimeline(ctx.schemaName, id)
  }
}
