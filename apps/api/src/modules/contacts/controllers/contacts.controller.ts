import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'
import { activeFieldDefs, UserRole } from '@repo/shared-types'
import type {
  FieldDef,
  TenantContext,
  AuthenticatedUser,
  Contact,
  ContactCounts,
  ContactDuplicateProbeResult,
  ContactTaxonomyUsage,
  PaginatedContacts,
  ContactTimeline,
  AnalyzeResult,
  ImportResult,
  ValidationPreview,
  ValidationReport,
} from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { parseAdvancedFilters } from '@/shared/utils/advanced-filters'
import { ContactsService } from '../services/contacts.service'
import { ContactImportService } from '../services/contact-import.service'
import { CustomFieldsValidator } from '@/modules/settings/services/custom-fields-validator.service'
import { TenantConfigService } from '@/modules/settings/services/tenant-config.service'
import {
  CreateContactDto,
  UpdateContactDto,
  ContactQueryDto,
  ProbeContactDuplicatesDto,
  ReassignTaxonomyDto,
  ExecuteContactImportDto,
  ContactTimelineQueryDto,
} from '../dto/contact.dto'

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly importService: ContactImportService,
    private readonly customFields: CustomFieldsValidator,
    private readonly tenantConfig: TenantConfigService,
  ) {}

  @Post('import/analyze')
  @ApiEndpoint({
    summary: 'Step 1: Upload CSV, analyze columns, suggest mappings, preview',
    roles: [UserRole.MANAGER],
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async analyzeImport(
    @UploadedFile() file: Express.Multer.File,
    @TenantCtx() ctx: TenantContext,
  ): Promise<AnalyzeResult> {
    return this.importService.analyze(file, await this.contactCustomFields(ctx.tenantId))
  }

  @Post('import/preview')
  @ApiEndpoint({
    summary: 'Re-validate the sample rows against the mapping the user confirmed',
    roles: [UserRole.MANAGER],
  })
  async previewImport(
    @Body() dto: ExecuteContactImportDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ValidationPreview> {
    return this.importService.preview(
      dto.fileId,
      dto.mapping ?? {},
      await this.contactCustomFields(ctx.tenantId),
    )
  }

  @Post('import/validate')
  @ApiEndpoint({
    summary: 'Validate every row in the file against the confirmed mapping',
    roles: [UserRole.MANAGER],
  })
  async validateImport(
    @Body() dto: ExecuteContactImportDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ValidationReport> {
    const taxonomy = await this.tenantConfig.getContactTaxonomy(ctx.tenantId)
    return this.importService.validate(
      ctx.schemaName,
      dto.fileId,
      dto.mapping ?? {},
      taxonomy,
      await this.contactCustomFields(ctx.tenantId),
    )
  }

  @Post('import/execute')
  @ApiEndpoint({
    summary: 'Step 2: Execute import with confirmed mappings and duplicate strategy',
    roles: [UserRole.MANAGER],
  })
  async executeImport(
    @Body() dto: ExecuteContactImportDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ImportResult> {
    const taxonomy = await this.tenantConfig.getContactTaxonomy(ctx.tenantId)
    return this.importService.execute(
      ctx.schemaName,
      dto.fileId,
      dto.mapping ?? {},
      dto.duplicateStrategy ?? 'skip',
      user.id,
      taxonomy,
      await this.contactCustomFields(ctx.tenantId),
    )
  }

  private async contactCustomFields(tenantId: string): Promise<FieldDef[]> {
    const config = await this.tenantConfig.getCustomFields(tenantId)
    return activeFieldDefs(config.contacts)
  }

  @Get()
  @ApiEndpoint({
    summary: 'List contacts with pagination, filters and full-text search',
    roles: [UserRole.VIEWER],
  })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @Query() query: ContactQueryDto,
  ): Promise<PaginatedContacts> {
    const { advanced, ...filters } = query
    return this.contactsService.findAll(ctx.schemaName, {
      ...filters,
      advanced: parseAdvancedFilters(advanced),
    })
  }

  @Post()
  @ApiEndpoint({
    summary: 'Create a contact; pass force=true to override soft duplicates',
    roles: [UserRole.SALES_REP],
  })
  async create(
    @Body() dto: CreateContactDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Query('force', new ParseBoolPipe({ optional: true })) force?: boolean,
  ): Promise<Contact> {
    await this.customFields.validate(ctx.tenantId, 'contacts', dto.customFields)
    const taxonomy = await this.tenantConfig.getContactTaxonomy(ctx.tenantId)
    return this.contactsService.create(ctx.schemaName, dto, user.id, force ?? false, taxonomy)
  }

  @Get('counts')
  @ApiEndpoint({ summary: 'Contact totals grouped by status', roles: [UserRole.VIEWER] })
  counts(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContactCounts> {
    return this.contactsService.counts(ctx.schemaName, user.id)
  }

  @Get('taxonomy-usage')
  @ApiEndpoint({
    summary: 'Contact totals grouped by status, source, type and tag',
    roles: [UserRole.VIEWER],
  })
  taxonomyUsage(@TenantCtx() ctx: TenantContext): Promise<ContactTaxonomyUsage> {
    return this.contactsService.taxonomyUsage(ctx.schemaName)
  }

  @Patch('reassign-taxonomy')
  @ApiEndpoint({
    summary: 'Move every contact from one taxonomy option or tag to another',
    roles: [UserRole.ADMIN],
  })
  reassignTaxonomy(
    @Body() dto: ReassignTaxonomyDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<{ reassigned: number }> {
    return this.contactsService.reassignTaxonomy(ctx.schemaName, dto.kind, dto.fromKey, dto.toKey)
  }

  @Get('duplicates/probe')
  @ApiEndpoint({
    summary: 'Probe potential duplicate contacts before saving',
    roles: [UserRole.VIEWER],
  })
  probeDuplicates(
    @TenantCtx() ctx: TenantContext,
    @Query() query: ProbeContactDuplicatesDto,
  ): Promise<ContactDuplicateProbeResult> {
    return this.contactsService.probeDuplicates(ctx.schemaName, query)
  }

  @Get(':id')
  @ApiEndpoint({
    summary: 'Get a single contact',
    roles: [UserRole.VIEWER],
    param: 'Contact UUID',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Contact> {
    return this.contactsService.findOne(ctx.schemaName, id)
  }

  @Patch(':id')
  @ApiEndpoint({ summary: 'Update a contact', roles: [UserRole.SALES_REP], param: 'Contact UUID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Query('force', new ParseBoolPipe({ optional: true })) force?: boolean,
  ): Promise<Contact> {
    await this.customFields.validate(ctx.tenantId, 'contacts', dto.customFields, 'update')
    const taxonomy = await this.tenantConfig.getContactTaxonomy(ctx.tenantId)
    return this.contactsService.update(ctx.schemaName, id, dto, force ?? false, taxonomy, {
      id: user.id,
      tenantId: ctx.tenantId,
    })
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Soft-delete a contact',
    roles: [UserRole.MANAGER],
    param: 'Contact UUID',
    status: HttpStatus.NO_CONTENT,
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.contactsService.remove(ctx.schemaName, id)
  }

  @Post(':id/restore')
  @ApiEndpoint({
    summary: 'Restore an archived contact',
    roles: [UserRole.MANAGER],
    param: 'Contact UUID',
    status: HttpStatus.OK,
  })
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Contact> {
    return this.contactsService.restore(ctx.schemaName, id, user.id)
  }

  @Get(':id/timeline')
  @ApiEndpoint({
    summary: 'Get contact timeline (activities + deals)',
    roles: [UserRole.VIEWER],
    param: 'Contact UUID',
  })
  getTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @Query() query: ContactTimelineQueryDto,
  ): Promise<ContactTimeline> {
    return this.contactsService.getTimeline(ctx.schemaName, id, query.limit)
  }
}
