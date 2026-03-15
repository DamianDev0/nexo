import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  TenantContext,
  AuthenticatedUser,
  Contact,
  PaginatedContacts,
  ContactTimeline,
} from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { ContactsService } from './contacts.service'
import { CreateContactDto, UpdateContactDto, ContactQueryDto } from './dto/contact.dto'

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List contacts with pagination, filters and full-text search' })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @Query() query: ContactQueryDto,
  ): Promise<PaginatedContacts> {
    return this.contactsService.findAll(ctx.schemaName, query)
  }

  @Post()
  @Auth(UserRole.SALES_REP)
  @ApiOperation({ summary: 'Create a contact' })
  create(
    @Body() dto: CreateContactDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Contact> {
    return this.contactsService.create(ctx.schemaName, dto, user.id)
  }

  @Get(':id')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiOperation({ summary: 'Get a single contact' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Contact> {
    return this.contactsService.findOne(ctx.schemaName, id)
  }

  @Patch(':id')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiOperation({ summary: 'Update a contact' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Contact> {
    return this.contactsService.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @Auth(UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiOperation({ summary: 'Soft-delete a contact' })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.contactsService.remove(ctx.schemaName, id)
  }

  @Get(':id/timeline')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiOperation({ summary: 'Get contact timeline (activities + deals)' })
  getTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ContactTimeline> {
    return this.contactsService.getTimeline(ctx.schemaName, id)
  }
}
