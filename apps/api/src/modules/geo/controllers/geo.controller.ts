import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { Department, Municipality } from '@repo/shared-types'

import { Auth } from '@/shared/decorators/auth.decorator'
import { GeoService } from '../services/geo.service'

@ApiTags('Geo – Colombia')
@Controller('geo')
export class GeoController {
  constructor(private readonly geo: GeoService) {}

  @Get('departments')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List the 33 DANE departments' })
  listDepartments(): Promise<Department[]> {
    return this.geo.listDepartments()
  }

  @Get('municipalities')
  @Auth(UserRole.VIEWER)
  @ApiQuery({ name: 'q', required: false, description: 'Name fragment, accent insensitive' })
  @ApiQuery({ name: 'department', required: false, description: 'DANE department code' })
  @ApiOperation({ summary: 'Search municipalities for an address autocomplete' })
  searchMunicipalities(
    @Query('q') q = '',
    @Query('department') department?: string,
  ): Promise<Municipality[]> {
    return this.geo.searchMunicipalities(q, department)
  }
}
