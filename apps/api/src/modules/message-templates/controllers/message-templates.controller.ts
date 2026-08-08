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
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  AuthenticatedUser,
  MessageTemplate,
  PaginatedTemplates,
  SendMessageResult,
  TemplatePreview,
  TenantContext,
} from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { MessageTemplatesService } from '../services/message-templates.service'

@ApiTags('Message Templates')
@Controller('message-templates')
export class MessageTemplatesController {
  constructor(private readonly service: MessageTemplatesService) {}

  @Get()
  @ApiEndpoint({
    summary: 'List message templates with optional channel/category filter',
    roles: [UserRole.VIEWER],
  })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @Query('channel') channel?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
  ): Promise<PaginatedTemplates> {
    return this.service.findAll(ctx.schemaName, channel, category, page ? Number(page) : 1)
  }

  @Get(':id')
  @ApiEndpoint({ summary: 'Get a message template by ID', roles: [UserRole.VIEWER] })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<MessageTemplate> {
    return this.service.findOne(ctx.schemaName, id)
  }

  @Post()
  @ApiEndpoint({
    summary: 'Create a message template (email, sms, whatsapp)',
    roles: [UserRole.ADMIN],
  })
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
  @ApiEndpoint({ summary: 'Update a message template', roles: [UserRole.ADMIN] })
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
  @ApiEndpoint({
    summary: 'Soft-delete a message template',
    roles: [UserRole.ADMIN],
    status: HttpStatus.NO_CONTENT,
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.service.remove(ctx.schemaName, id)
  }

  @Post(':id/preview')
  @ApiEndpoint({
    summary: 'Preview a template with Handlebars rendering',
    roles: [UserRole.VIEWER],
  })
  preview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() variables: Record<string, string>,
    @TenantCtx() ctx: TenantContext,
  ): Promise<TemplatePreview> {
    return this.service.preview(ctx.schemaName, id, variables)
  }

  @Post(':id/send')
  @ApiEndpoint({
    summary: 'Send a template to recipients (queued for delivery)',
    roles: [UserRole.SALES_REP],
  })
  send(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { recipients: string[]; variables: Record<string, string> },
    @TenantCtx() ctx: TenantContext,
  ): Promise<SendMessageResult> {
    return this.service.send(ctx.schemaName, id, dto.recipients, dto.variables)
  }

  @Post(':id/duplicate')
  @ApiEndpoint({ summary: 'Duplicate a template', roles: [UserRole.ADMIN] })
  duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MessageTemplate> {
    return this.service.duplicate(ctx.schemaName, id, user.id)
  }
}
