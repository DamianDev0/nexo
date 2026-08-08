import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  TenantContext,
  AuthenticatedUser,
  Company,
  PaginatedCompanies,
  CompanySummary,
} from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { CompaniesService } from '../services/companies.service'
import { CustomFieldsValidator } from '@/modules/settings/services/custom-fields-validator.service'
import {
  AssignContactDto,
  CompanyQueryDto,
  CreateCompanyDto,
  UpdateCompanyDto,
} from '../dto/company.dto'

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly customFields: CustomFieldsValidator,
  ) {}

  @Get()
  @ApiEndpoint({
    summary: 'List companies with pagination, filters and full-text search',
    roles: [UserRole.VIEWER],
  })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @Query() query: CompanyQueryDto,
  ): Promise<PaginatedCompanies> {
    return this.companiesService.findAll(ctx.schemaName, query)
  }

  @Post()
  @ApiEndpoint({ summary: 'Create a company', roles: [UserRole.SALES_REP] })
  async create(
    @Body() dto: CreateCompanyDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Company> {
    await this.customFields.validate(ctx.tenantId, 'companies', dto.customFields)
    return this.companiesService.create(ctx.schemaName, dto, user.id)
  }

  @Get(':id')
  @ApiEndpoint({
    summary: 'Get a single company',
    roles: [UserRole.VIEWER],
    param: 'Company UUID',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Company> {
    return this.companiesService.findOne(ctx.schemaName, id)
  }

  @Patch(':id')
  @ApiEndpoint({ summary: 'Update a company', roles: [UserRole.SALES_REP], param: 'Company UUID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Company> {
    await this.customFields.validate(ctx.tenantId, 'companies', dto.customFields)
    return this.companiesService.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Soft-delete a company',
    roles: [UserRole.MANAGER],
    param: 'Company UUID',
    status: HttpStatus.NO_CONTENT,
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.companiesService.remove(ctx.schemaName, id)
  }

  @Get(':id/summary')
  @ApiEndpoint({
    summary: 'Get company summary — stats + contacts + active deals',
    roles: [UserRole.VIEWER],
    param: 'Company UUID',
  })
  getSummary(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<CompanySummary> {
    return this.companiesService.getSummary(ctx.schemaName, id)
  }

  @Post(':id/contacts')
  @ApiEndpoint({
    summary: 'Assign an existing contact to this company',
    roles: [UserRole.SALES_REP],
    param: 'Company UUID',
    status: HttpStatus.NO_CONTENT,
  })
  assignContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignContactDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<void> {
    return this.companiesService.assignContact(ctx.schemaName, id, dto.contactId)
  }

  @Delete(':id/contacts/:contactId')
  @ApiEndpoint({
    summary: 'Remove a contact from this company',
    roles: [UserRole.SALES_REP],
    param: 'Company UUID',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'contactId', description: 'Contact UUID' })
  removeContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<void> {
    return this.companiesService.removeContact(ctx.schemaName, id, contactId)
  }
}
