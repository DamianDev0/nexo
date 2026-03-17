import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  TenantContext,
  AuthenticatedUser,
  Company,
  PaginatedCompanies,
  CompanySummary,
} from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { CompaniesService } from './companies.service'
import {
  AssignContactDto,
  CompanyQueryDto,
  CreateCompanyDto,
  UpdateCompanyDto,
} from './dto/company.dto'

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List companies with pagination, filters and full-text search' })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @Query() query: CompanyQueryDto,
  ): Promise<PaginatedCompanies> {
    return this.companiesService.findAll(ctx.schemaName, query)
  }

  @Post()
  @Auth(UserRole.SALES_REP)
  @ApiOperation({ summary: 'Create a company' })
  create(
    @Body() dto: CreateCompanyDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Company> {
    return this.companiesService.create(ctx.schemaName, dto, user.id)
  }

  @Get(':id')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiOperation({ summary: 'Get a single company' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Company> {
    return this.companiesService.findOne(ctx.schemaName, id)
  }

  @Patch(':id')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiOperation({ summary: 'Update a company' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Company> {
    return this.companiesService.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @Auth(UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiOperation({ summary: 'Soft-delete a company' })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.companiesService.remove(ctx.schemaName, id)
  }

  @Get(':id/summary')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiOperation({
    summary: 'Get company summary — stats + contacts + active deals',
  })
  getSummary(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<CompanySummary> {
    return this.companiesService.getSummary(ctx.schemaName, id)
  }

  @Post(':id/contacts')
  @Auth(UserRole.SALES_REP)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiOperation({ summary: 'Assign an existing contact to this company' })
  assignContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignContactDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<void> {
    return this.companiesService.assignContact(ctx.schemaName, id, dto.contactId)
  }

  @Delete(':id/contacts/:contactId')
  @Auth(UserRole.SALES_REP)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiParam({ name: 'contactId', description: 'Contact UUID' })
  @ApiOperation({ summary: 'Remove a contact from this company' })
  removeContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<void> {
    return this.companiesService.removeContact(ctx.schemaName, id, contactId)
  }
}
