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
import type { TenantContext, Webhook, WebhookLog } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { WebhooksService } from '../services/webhooks.service'
import { CreateWebhookDto, UpdateWebhookDto } from '../dto/webhook.dto'

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}

  @Get()
  @ApiEndpoint({ summary: 'List all configured webhooks', roles: [UserRole.ADMIN] })
  findAll(@TenantCtx() ctx: TenantContext): Promise<Webhook[]> {
    return this.service.findAll(ctx.schemaName)
  }

  @Post()
  @ApiEndpoint({
    summary: 'Create a webhook (auto-generates HMAC secret)',
    roles: [UserRole.ADMIN],
  })
  create(@Body() dto: CreateWebhookDto, @TenantCtx() ctx: TenantContext): Promise<Webhook> {
    return this.service.create(ctx.schemaName, dto)
  }

  @Patch(':id')
  @ApiEndpoint({ summary: 'Update webhook URL, events, or active status', roles: [UserRole.ADMIN] })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWebhookDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Webhook> {
    return this.service.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Delete a webhook and its logs',
    roles: [UserRole.ADMIN],
    status: HttpStatus.NO_CONTENT,
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.service.remove(ctx.schemaName, id)
  }

  @Get(':id/logs')
  @ApiEndpoint({ summary: 'Get delivery logs for a webhook', roles: [UserRole.ADMIN] })
  getLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @Query('limit') limit?: string,
  ): Promise<WebhookLog[]> {
    return this.service.getLogs(ctx.schemaName, id, limit ? Number(limit) : 20)
  }
}
