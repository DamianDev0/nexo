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
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext, AuthenticatedUser, ContactView } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { ContactViewsService } from './services/contact-views.service'
import {
  CreateContactViewDto,
  DuplicateContactViewDto,
  ReorderContactViewsDto,
  UpdateContactViewDto,
} from './dto/contact-view.dto'

@ApiTags('Contact Views')
@Controller('contacts/views')
export class ContactViewsController {
  constructor(private readonly views: ContactViewsService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List own and shared contact views' })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContactView[]> {
    return this.views.findAll(ctx.schemaName, user.id)
  }

  @Post()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Create a contact view' })
  create(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateContactViewDto,
  ): Promise<ContactView> {
    return this.views.create(ctx.schemaName, user.id, dto)
  }

  @Patch('reorder')
  @Auth(UserRole.VIEWER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reorder own contact views' })
  reorder(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderContactViewsDto,
  ): Promise<void> {
    return this.views.reorder(ctx.schemaName, user.id, dto)
  }

  @Patch(':id')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Update a contact view' })
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
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Duplicate a visible contact view' })
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
  @Auth(UserRole.VIEWER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an own contact view' })
  @ApiParam({ name: 'id', format: 'uuid' })
  remove(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.views.remove(ctx.schemaName, user.id, id)
  }
}
