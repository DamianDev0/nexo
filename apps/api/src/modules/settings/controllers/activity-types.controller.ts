import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext, ActivityTypeDef } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TenantConfigService } from '../services/tenant-config.service'
import { ActivityTypeDto } from '../dto/activity-type.dto'

@ApiTags('Settings – Activity Types')
@Controller('settings/activity-types')
export class ActivityTypesController {
  constructor(private readonly configService: TenantConfigService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List activity types (system + custom)' })
  getAll(@TenantCtx() ctx: TenantContext): Promise<ActivityTypeDef[]> {
    return this.configService.getActivityTypes(ctx.tenantId)
  }

  @Post()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a custom activity type' })
  async create(
    @Body() dto: ActivityTypeDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ActivityTypeDef[]> {
    const current = await this.configService.getActivityTypes(ctx.tenantId)
    if (current.some((t) => t.key === dto.key)) {
      throw new BadRequestException(`Activity type key '${dto.key}' already exists`)
    }
    const updated = [...current, { ...dto, isSystem: false }]
    return this.configService.updateActivityTypes(ctx.tenantId, updated, ctx.slug)
  }

  @Put(':key')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'key', description: 'Activity type key' })
  @ApiOperation({ summary: 'Update an activity type label/icon/color' })
  async update(
    @Param('key') key: string,
    @Body() dto: ActivityTypeDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ActivityTypeDef[]> {
    const current = await this.configService.getActivityTypes(ctx.tenantId)
    const idx = current.findIndex((t) => t.key === key)
    if (idx === -1) throw new BadRequestException(`Activity type '${key}' not found`)

    const updated = [...current]
    updated[idx] = { ...dto, key, isSystem: current[idx]!.isSystem }
    return this.configService.updateActivityTypes(ctx.tenantId, updated, ctx.slug)
  }

  @Delete(':key')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'key', description: 'Activity type key' })
  @ApiOperation({ summary: 'Delete a custom activity type (system types cannot be deleted)' })
  async remove(
    @Param('key') key: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ActivityTypeDef[]> {
    const current = await this.configService.getActivityTypes(ctx.tenantId)
    const target = current.find((t) => t.key === key)
    if (!target) throw new BadRequestException(`Activity type '${key}' not found`)
    if (target.isSystem)
      throw new BadRequestException(`System activity type '${key}' cannot be deleted`)

    const updated = current.filter((t) => t.key !== key)
    return this.configService.updateActivityTypes(ctx.tenantId, updated, ctx.slug)
  }
}
