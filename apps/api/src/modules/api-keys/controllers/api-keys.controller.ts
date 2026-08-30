import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { ApiKey, AuthenticatedUser, TenantContext } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { CreateApiKeyDto } from '../dto/create-api-key.dto'
import { ApiKeysService } from '../services/api-keys.service'

@ApiTags('API Keys')
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly service: ApiKeysService) {}

  @Get()
  @ApiEndpoint({
    summary: 'List all API keys (hash hidden, only prefix shown)',
    roles: [UserRole.ADMIN],
  })
  findAll(@TenantCtx() ctx: TenantContext): Promise<ApiKey[]> {
    return this.service.findAll(ctx.schemaName)
  }

  @Post()
  @ApiEndpoint({
    summary: 'Create an API key (raw key shown ONLY once in response)',
    roles: [UserRole.OWNER],
  })
  create(
    @Body() dto: CreateApiKeyDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiKey & { rawKey: string }> {
    return this.service.create(ctx.schemaName, dto, user.id)
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Revoke an API key',
    roles: [UserRole.OWNER],
    status: HttpStatus.NO_CONTENT,
  })
  revoke(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.service.revoke(ctx.schemaName, id)
  }
}
