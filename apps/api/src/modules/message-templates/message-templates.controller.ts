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
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  AuthenticatedUser,
  MessageTemplate,
  PaginatedTemplates,
  TemplatePreview,
  TenantContext,
} from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { MessageTemplatesService } from './message-templates.service'

@ApiTags('Message Templates')
@Controller('message-templates')
export class MessageTemplatesController {
  constructor(private readonly service: MessageTemplatesService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List message templates with optional channel/category filter' })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @Query('channel') channel?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
  ): Promise<PaginatedTemplates> {
    return this.service.findAll(ctx.schemaName, channel, category, page ? Number(page) : 1)
  }

  @Get(':id')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Get a message template by ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<MessageTemplate> {
    return this.service.findOne(ctx.schemaName, id)
  }

  @Post()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a message template (email, sms, whatsapp)' })
  create(
    @Body()
    dto: {
      name: string
      channel: string
      subject?: string
      body: string
      variables?: string[]
      category?: string
    },
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MessageTemplate> {
    return this.service.create(ctx.schemaName, dto, user.id)
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a message template' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    dto: Partial<{
      name: string
      subject: string
      body: string
      variables: string[]
      category: string
    }>,
    @TenantCtx() ctx: TenantContext,
  ): Promise<MessageTemplate> {
    return this.service.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a message template' })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.service.remove(ctx.schemaName, id)
  }

  @Post(':id/preview')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Preview a template with variable substitution' })
  preview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() variables: Record<string, string>,
    @TenantCtx() ctx: TenantContext,
  ): Promise<TemplatePreview> {
    return this.service.preview(ctx.schemaName, id, variables)
  }
}
