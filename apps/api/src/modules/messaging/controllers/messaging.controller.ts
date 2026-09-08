import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { AuthenticatedUser, Message, TenantContext } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { RecentByContactQueryDto } from '@/shared/dto/recent-by-contact-query.dto'
import { SendMessageDto } from '../dto/send-message.dto'
import { MessagingService } from '../services/messaging.service'

@ApiTags('Messaging')
@Controller('messaging/messages')
export class MessagingController {
  constructor(private readonly messaging: MessagingService) {}

  @Post()
  @ApiEndpoint({
    summary: 'Queue an outbound message to a phone number',
    roles: [UserRole.SALES_REP],
    status: HttpStatus.ACCEPTED,
  })
  send(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendMessageDto,
  ): Promise<Message> {
    return this.messaging.send(ctx.schemaName, user, dto)
  }

  @Get()
  @ApiEndpoint({ summary: 'List recent messages', roles: [UserRole.VIEWER] })
  findRecent(
    @TenantCtx() ctx: TenantContext,
    @Query() query: RecentByContactQueryDto,
  ): Promise<Message[]> {
    return this.messaging.findRecent(ctx.schemaName, query)
  }

  @Get(':id')
  @ApiEndpoint({ summary: 'Get a message by id', roles: [UserRole.VIEWER], param: 'Message UUID' })
  findOne(
    @TenantCtx() ctx: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Message> {
    return this.messaging.findOne(ctx.schemaName, id)
  }
}
