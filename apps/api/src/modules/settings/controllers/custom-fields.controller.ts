import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { assertValidEntity, VALID_ENTITIES } from '../constants/custom-field-entities'
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service'
import { TenantConfigService } from '../services/tenant-config.service'
import {
  FieldDefDto,
  PatchFieldDefDto,
  UpdateCustomFieldsDto,
  UpdateFieldPermissionsDto,
} from '../dto/custom-fields.dto'
import type {
  CustomFieldsConfig,
  FieldDef,
  FieldPermission,
  FieldPermissionsConfig,
} from '../interfaces/custom-field.interface'

@ApiTags('Settings – Custom Fields')
@Controller('settings/custom-fields')
export class CustomFieldsController {
  constructor(
    private readonly configService: TenantConfigService,
    private readonly audit: AuditLogService,
  ) {}

  private auditChange(ctx: TenantContext, description: string): Promise<void> {
    return this.audit.settingsUpdated(
      ctx.tenantId,
      undefined,
      ctx.schemaName,
      undefined,
      description,
    )
  }

  @Get()
  @ApiEndpoint({ summary: 'Get all custom fields for all entities', roles: [UserRole.VIEWER] })
  getAllCustomFields(@TenantCtx() ctx: TenantContext): Promise<CustomFieldsConfig> {
    return this.configService.getCustomFields(ctx.tenantId)
  }

  @Get('permissions/:entity')
  @ApiEndpoint({
    summary: 'Get field permissions for a specific entity',
    roles: [UserRole.ADMIN],
  })
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  async getFieldPermissions(
    @Param('entity') entity: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Record<string, FieldPermission>> {
    assertValidEntity(entity)
    const config = await this.configService.getFieldPermissions(ctx.tenantId)
    return config[entity]
  }

  @Patch('permissions/:entity')
  @ApiEndpoint({
    summary: 'Update field permissions for a specific entity',
    roles: [UserRole.ADMIN],
    status: HttpStatus.OK,
  })
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  async updateFieldPermissions(
    @Param('entity') entity: string,
    @Body() dto: UpdateFieldPermissionsDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<FieldPermissionsConfig> {
    assertValidEntity(entity)
    const current = await this.configService.getFieldPermissions(ctx.tenantId)
    const entityPermissions = Object.fromEntries(
      dto.permissions.map(({ key, visibility, editable }) => [key, { visibility, editable }]),
    )
    const updated: FieldPermissionsConfig = { ...current, [entity]: entityPermissions }
    const result = await this.configService.updateFieldPermissions(ctx.tenantId, updated, ctx.slug)
    await this.auditChange(ctx, `Field permissions updated on ${entity}`)
    return result
  }

  @Get(':entity')
  @ApiEndpoint({ summary: 'Get custom fields for a specific entity', roles: [UserRole.VIEWER] })
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  async getEntityFields(
    @Param('entity') entity: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<FieldDef[]> {
    assertValidEntity(entity)
    const config = await this.configService.getCustomFields(ctx.tenantId)
    return config[entity]
  }

  @Post(':entity')
  @ApiEndpoint({
    summary: 'Add a single custom field to an entity',
    roles: [UserRole.ADMIN],
    status: HttpStatus.CREATED,
  })
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
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
    await this.auditChange(ctx, `Custom field "${field.key}" created on ${entity}`)
    return field
  }

  @Patch(':entity')
  @ApiEndpoint({
    summary: 'Replace all custom fields for a specific entity',
    roles: [UserRole.ADMIN],
    status: HttpStatus.OK,
  })
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  @ApiOkResponse({ description: 'Updated custom fields' })
  async updateEntityFields(
    @Param('entity') entity: string,
    @Body() dto: UpdateCustomFieldsDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<CustomFieldsConfig> {
    assertValidEntity(entity)
    const current = await this.configService.getCustomFields(ctx.tenantId)
    const updated: CustomFieldsConfig = { ...current, [entity]: dto.fields }
    const result = await this.configService.updateCustomFields(ctx.tenantId, updated, ctx.slug)
    await this.auditChange(ctx, `Custom fields replaced on ${entity}`)
    return result
  }

  @Patch(':entity/:key')
  @ApiEndpoint({
    summary: 'Update a single custom field',
    roles: [UserRole.ADMIN],
    status: HttpStatus.OK,
  })
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  @ApiParam({ name: 'key', description: 'Field key' })
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
    await this.auditChange(ctx, `Custom field "${key}" updated on ${entity}`)
    return merged
  }

  @Delete(':entity/:key')
  @ApiEndpoint({
    summary: 'Archive a single custom field, keeping stored values intact',
    roles: [UserRole.ADMIN],
    status: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  @ApiParam({ name: 'key', description: 'Field key' })
  @ApiNoContentResponse({ description: 'Field archived' })
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
      {
        ...current,
        [entity]: fields.map((f) => (f.key === key ? { ...f, isActive: false } : f)),
      },
      ctx.slug,
    )
    await this.auditChange(ctx, `Custom field "${key}" archived on ${entity}`)
  }
}
