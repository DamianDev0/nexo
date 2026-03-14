import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { TenantsService } from '../services/tenants.service'
import { CreateTenantDto } from '../dto/create-tenant.dto'
import { TenantResponseDto } from '../dto/tenant-response.dto'

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new tenant' })
  create(@Body() dto: CreateTenantDto): Promise<TenantResponseDto> {
    return this.tenantsService.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'List all active tenants' })
  findAll(): Promise<TenantResponseDto[]> {
    return this.tenantsService.findAll()
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a tenant by slug' })
  findBySlug(@Param('slug') slug: string): Promise<TenantResponseDto> {
    return this.tenantsService.findBySlug(slug)
  }
}
