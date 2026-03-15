import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantsService } from '../services/tenants.service'
import { CreateTenantDto } from '../dto/create-tenant.dto'
import { TenantResponseDto } from '../dto/tenant-response.dto'

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Auth(UserRole.OWNER)
  @ApiOperation({ summary: 'Register a new tenant (internal — prefer POST /auth/onboard)' })
  create(@Body() dto: CreateTenantDto): Promise<TenantResponseDto> {
    return this.tenantsService.create(dto)
  }

  @Get()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all active tenants' })
  findAll(): Promise<TenantResponseDto[]> {
    return this.tenantsService.findAll()
  }

  @Get(':slug')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Get a tenant by slug' })
  findBySlug(@Param('slug') slug: string): Promise<TenantResponseDto> {
    return this.tenantsService.findBySlug(slug)
  }
}
