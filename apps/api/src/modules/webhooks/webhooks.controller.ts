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
import type { TenantContext, Webhook, WebhookLog } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { WebhooksService } from './webhooks.service'

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}

  @Get()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all configured webhooks' })
  findAll(@TenantCtx() ctx: TenantContext): Promise<Webhook[]> {
    return this.service.findAll(ctx.schemaName)
  }

  @Post()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a webhook (auto-generates HMAC secret)' })
  create(
    @Body() dto: { url: string; events: string[] },
    @TenantCtx() ctx: TenantContext,
  ): Promise<Webhook> {
    return this.service.create(ctx.schemaName, dto)
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update webhook URL, events, or active status' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { url?: string; events?: string[]; isActive?: boolean },
    @TenantCtx() ctx: TenantContext,
  ): Promise<Webhook> {
    return this.service.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a webhook and its logs' })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.service.remove(ctx.schemaName, id)
  }

  @Get(':id/logs')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get delivery logs for a webhook' })
  getLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @Query('limit') limit?: string,
  ): Promise<WebhookLog[]> {
    return this.service.getLogs(ctx.schemaName, id, limit ? Number(limit) : 20)
  }
}
