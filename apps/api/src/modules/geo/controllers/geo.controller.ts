import { Controller, Get, Query } from '@nestjs/common'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { AddressSuggestion, Department, Municipality } from '@repo/shared-types'

import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { GeoService } from '../services/geo.service'
import { AddressAutocompleteService } from '../services/address-autocomplete.service'
import { AddressSuggestionsQueryDto } from '../dto/address-suggestions-query.dto'

@ApiTags('Geo – Colombia')
@Controller('geo')
export class GeoController {
  constructor(
    private readonly geo: GeoService,
    private readonly addresses: AddressAutocompleteService,
  ) {}

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

  @Get('address-suggestions')
  @ApiEndpoint({
    summary: 'Autocomplete a street address via Google Places, restricted to Colombia',
    roles: [UserRole.VIEWER],
  })
  suggestAddresses(@Query() query: AddressSuggestionsQueryDto): Promise<AddressSuggestion[]> {
    return this.addresses.suggest(query.q, query.sessionToken)
  }
}
