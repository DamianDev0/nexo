import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantsService } from '../services/tenants.service'
import { CreateTenantDto } from '../dto/create-tenant.dto'
import { TenantResponseDto } from '../dto/tenant-response.dto'

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiEndpoint({
    summary: 'Register a new tenant (internal — prefer POST /auth/onboard)',
    roles: [UserRole.SUPER_ADMIN],
  })
  create(@Body() dto: CreateTenantDto): Promise<TenantResponseDto> {
    return this.tenantsService.create(dto)
  }

  @Get()
  @ApiEndpoint({ summary: 'List all active tenants', roles: [UserRole.SUPER_ADMIN] })
  findAll(): Promise<TenantResponseDto[]> {
    return this.tenantsService.findAll()
  }

  @Get(':slug')
  @ApiEndpoint({ summary: 'Get a tenant by slug', roles: [UserRole.VIEWER] })
  findBySlug(@Param('slug') slug: string): Promise<TenantResponseDto> {
    return this.tenantsService.findBySlug(slug)
  }
}
