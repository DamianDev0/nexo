import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TenantConfigService } from '../services/tenant-config.service'
import {
  FieldDefDto,
  PatchFieldDefDto,
  UpdateCustomFieldsDto,
  UpdateFieldPermissionsDto,
} from '../dto/custom-fields.dto'
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

  @Post(':entity')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  @ApiOperation({ summary: 'Add a single custom field to an entity' })
  @ApiCreatedResponse({ description: 'Field created' })
  async createField(
    @Param('entity') entity: string,
    @Body() dto: FieldDefDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<FieldDef> {
    assertValidEntity(entity)
    const current = await this.configService.getCustomFields(ctx.tenantId)
    const fields = current[entity]

    if (fields.some((f) => f.key === dto.key)) {
      throw new BadRequestException(`A field with key "${dto.key}" already exists on ${entity}`)
    }

    const order = dto.order ?? fields.length + 1
    const field: FieldDef = { ...dto, order }
    const updated: CustomFieldsConfig = { ...current, [entity]: [...fields, field] }
    await this.configService.updateCustomFields(ctx.tenantId, updated, ctx.slug)
    return field
  }

  @Patch(':entity')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  @ApiOperation({ summary: 'Replace all custom fields for a specific entity' })
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

  @Patch(':entity/:key')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  @ApiParam({ name: 'key', description: 'Field key' })
  @ApiOperation({ summary: 'Update a single custom field' })
  @ApiOkResponse({ description: 'Updated field' })
  async updateField(
    @Param('entity') entity: string,
    @Param('key') key: string,
    @Body() dto: PatchFieldDefDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<FieldDef> {
    assertValidEntity(entity)
    const current = await this.configService.getCustomFields(ctx.tenantId)
    const fields = current[entity]
    const index = fields.findIndex((f) => f.key === key)

    if (index === -1) {
      throw new NotFoundException(`Field "${key}" not found on ${entity}`)
    }

    const merged: FieldDef = { ...fields[index]!, ...dto, key }
    const updatedFields = fields.map((f, i) => (i === index ? merged : f))
    await this.configService.updateCustomFields(
      ctx.tenantId,
      { ...current, [entity]: updatedFields },
      ctx.slug,
    )
    return merged
  }

  @Delete(':entity/:key')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  @ApiParam({ name: 'key', description: 'Field key' })
  @ApiOperation({ summary: 'Delete a single custom field' })
  @ApiNoContentResponse({ description: 'Field deleted' })
  async deleteField(
    @Param('entity') entity: string,
    @Param('key') key: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<void> {
    assertValidEntity(entity)
    const current = await this.configService.getCustomFields(ctx.tenantId)
    const fields = current[entity]

    if (!fields.some((f) => f.key === key)) {
      throw new NotFoundException(`Field "${key}" not found on ${entity}`)
    }

    await this.configService.updateCustomFields(
      ctx.tenantId,
      { ...current, [entity]: fields.filter((f) => f.key !== key) },
      ctx.slug,
    )
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
