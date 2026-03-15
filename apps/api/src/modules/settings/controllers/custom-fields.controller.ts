import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TenantConfigService } from '../services/tenant-config.service'
import { UpdateCustomFieldsDto, UpdateFieldPermissionsDto } from '../dto/custom-fields.dto'
import type {
  CustomFieldEntity,
  CustomFieldsConfig,
  FieldDef,
  FieldPermission,
  FieldPermissionsConfig,
} from '../interfaces/custom-field.interface'

const VALID_ENTITIES: CustomFieldEntity[] = ['contacts', 'companies', 'deals']

function assertValidEntity(entity: string): asserts entity is CustomFieldEntity {
  if (!VALID_ENTITIES.includes(entity as CustomFieldEntity)) {
    throw new BadRequestException(
      `Invalid entity: ${entity}. Must be one of: ${VALID_ENTITIES.join(', ')}`,
    )
  }
}

@ApiTags('Settings – Custom Fields')
@Controller('settings/custom-fields')
export class CustomFieldsController {
  constructor(private readonly configService: TenantConfigService) {}

  @Get()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all custom fields for all entities' })
  getAllCustomFields(@TenantCtx() ctx: TenantContext): Promise<CustomFieldsConfig> {
    return this.configService.getCustomFields(ctx.tenantId)
  }

  @Get(':entity')
  @Auth(UserRole.ADMIN)
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  @ApiOperation({ summary: 'Get custom fields for a specific entity' })
  async getEntityFields(
    @Param('entity') entity: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<FieldDef[]> {
    assertValidEntity(entity)
    const config = await this.configService.getCustomFields(ctx.tenantId)
    return config[entity]
  }

  @Patch(':entity')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  @ApiOperation({ summary: 'Replace custom fields for a specific entity' })
  @ApiOkResponse({ description: 'Updated custom fields' })
  async updateEntityFields(
    @Param('entity') entity: string,
    @Body() dto: UpdateCustomFieldsDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<CustomFieldsConfig> {
    assertValidEntity(entity)
    const current = await this.configService.getCustomFields(ctx.tenantId)
    const updated: CustomFieldsConfig = { ...current, [entity]: dto.fields }
    return this.configService.updateCustomFields(ctx.tenantId, updated, ctx.slug)
  }

  @Get('permissions/:entity')
  @Auth(UserRole.ADMIN)
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  @ApiOperation({ summary: 'Get field permissions for a specific entity' })
  async getFieldPermissions(
    @Param('entity') entity: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Record<string, FieldPermission>> {
    assertValidEntity(entity)
    const config = await this.configService.getFieldPermissions(ctx.tenantId)
    return config[entity]
  }

  @Patch('permissions/:entity')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  @ApiOperation({ summary: 'Update field permissions for a specific entity' })
  async updateFieldPermissions(
    @Param('entity') entity: string,
    @Body() dto: UpdateFieldPermissionsDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<FieldPermissionsConfig> {
    assertValidEntity(entity)
    const current = await this.configService.getFieldPermissions(ctx.tenantId)
    const updated: FieldPermissionsConfig = { ...current, [entity]: dto.permissions }
    return this.configService.updateFieldPermissions(ctx.tenantId, updated, ctx.slug)
  }
}
