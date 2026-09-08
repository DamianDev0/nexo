import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { UserRole } from '@repo/shared-types'
import type { AuthenticatedUser, Call, TenantContext, VoiceToken } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CallQueryDto } from '../dto/call-query.dto'
import { CallsService } from '../services/calls.service'
import { TelephonyService } from '../services/telephony.service'

const TOKEN_THROTTLE = { default: { limit: 30, ttl: 60_000 } }

@ApiTags('Telephony')
@Controller('telephony')
export class TelephonyController {
  constructor(
    private readonly telephony: TelephonyService,
    private readonly calls: CallsService,
  ) {}

  @Get('voice/token')
  @Throttle(TOKEN_THROTTLE)
  @ApiEndpoint({ summary: 'Issue a short-lived browser voice token', roles: [UserRole.SALES_REP] })
  voiceToken(@CurrentUser() user: AuthenticatedUser): VoiceToken {
    return this.telephony.issueVoiceToken(user)
  }

  @Get('calls')
  @ApiEndpoint({ summary: 'List recent calls', roles: [UserRole.VIEWER] })
  findRecent(@TenantCtx() ctx: TenantContext, @Query() query: CallQueryDto): Promise<Call[]> {
    return this.calls.findRecent(ctx.schemaName, query)
  }

  @Get('calls/:id')
  @ApiEndpoint({ summary: 'Get a call by id', roles: [UserRole.VIEWER], param: 'Call UUID' })
  findOne(@TenantCtx() ctx: TenantContext, @Param('id', ParseUUIDPipe) id: string): Promise<Call> {
    return this.calls.findOne(ctx.schemaName, id)
  }
}
