import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext, AuthenticatedUser, ContactView } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { ContactViewsService } from '../services/contact-views.service'
import {
  CreateContactViewDto,
  DuplicateContactViewDto,
  ReorderContactViewsDto,
  UpdateContactViewDto,
} from '../dto/contact-view.dto'

@ApiTags('Contact Views')
@Controller('contacts/views')
export class ContactViewsController {
  constructor(private readonly views: ContactViewsService) {}

  @Get()
  @ApiEndpoint({ summary: 'List own and shared contact views', roles: [UserRole.VIEWER] })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContactView[]> {
    return this.views.findAll(ctx.schemaName, user.id)
  }

  @Post()
  @ApiEndpoint({ summary: 'Create a contact view', roles: [UserRole.VIEWER] })
  create(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateContactViewDto,
  ): Promise<ContactView> {
    return this.views.create(ctx.schemaName, user.id, dto)
  }

  @Patch('reorder')
  @ApiEndpoint({
    summary: 'Reorder own contact views',
    roles: [UserRole.VIEWER],
    status: HttpStatus.NO_CONTENT,
  })
  reorder(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderContactViewsDto,
  ): Promise<void> {
    return this.views.reorder(ctx.schemaName, user.id, dto)
  }

  @Patch(':id')
  @ApiEndpoint({ summary: 'Update a contact view', roles: [UserRole.VIEWER] })
  @ApiParam({ name: 'id', format: 'uuid' })
  update(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactViewDto,
  ): Promise<ContactView> {
    return this.views.update(ctx.schemaName, user.id, id, dto)
  }

  @Post(':id/duplicate')
  @ApiEndpoint({ summary: 'Duplicate a visible contact view', roles: [UserRole.VIEWER] })
  @ApiParam({ name: 'id', format: 'uuid' })
  duplicate(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DuplicateContactViewDto,
  ): Promise<ContactView> {
    return this.views.duplicate(ctx.schemaName, user.id, id, dto)
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Delete an own contact view',
    roles: [UserRole.VIEWER],
    status: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  remove(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.views.remove(ctx.schemaName, user.id, id)
  }
}
