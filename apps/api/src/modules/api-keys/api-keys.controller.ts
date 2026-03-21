import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { ApiKey, AuthenticatedUser, TenantContext } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { ApiKeysService } from './api-keys.service'

@ApiTags('API Keys')
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly service: ApiKeysService) {}

  @Get()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all API keys (hash hidden, only prefix shown)' })
  findAll(@TenantCtx() ctx: TenantContext): Promise<ApiKey[]> {
    return this.service.findAll(ctx.schemaName)
  }

  @Post()
  @Auth(UserRole.OWNER)
  @ApiOperation({ summary: 'Create an API key (raw key shown ONLY once in response)' })
  create(
    @Body() dto: { name: string; scopes?: string[]; expiresAt?: string },
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiKey & { rawKey: string }> {
    return this.service.create(ctx.schemaName, dto, user.id)
  }

  @Delete(':id')
  @Auth(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke an API key' })
  revoke(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.service.revoke(ctx.schemaName, id)
  }
}
