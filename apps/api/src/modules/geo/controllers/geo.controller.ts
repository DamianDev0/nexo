import { Controller, Get, Query } from '@nestjs/common'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { Department, Municipality } from '@repo/shared-types'

import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { GeoService } from '../services/geo.service'

@ApiTags('Geo – Colombia')
@Controller('geo')
export class GeoController {
  constructor(private readonly geo: GeoService) {}

  @Get('departments')
  @ApiEndpoint({ summary: 'List the 33 DANE departments', roles: [UserRole.VIEWER] })
  listDepartments(): Promise<Department[]> {
    return this.geo.listDepartments()
  }

  @Get('municipalities')
  @ApiEndpoint({
    summary: 'Search municipalities for an address autocomplete',
    roles: [UserRole.VIEWER],
  })
  @ApiQuery({ name: 'q', required: false, description: 'Name fragment, accent insensitive' })
  @ApiQuery({ name: 'department', required: false, description: 'DANE department code' })
  searchMunicipalities(
    @Query('q') q = '',
    @Query('department') department?: string,
  ): Promise<Municipality[]> {
    return this.geo.searchMunicipalities(q, department)
  }
}
