import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { GeoController } from './controllers/geo.controller'
import { Municipality } from './entities/municipality.entity'
import { GeoRepository } from './repositories/geo.repository'
import { AddressAutocompleteService } from './services/address-autocomplete.service'
import { GeoSeedService } from './services/geo-seed.service'
import { GeoService } from './services/geo.service'

@Module({
  imports: [TypeOrmModule.forFeature([Municipality])],
  controllers: [GeoController],
  providers: [GeoService, GeoSeedService, GeoRepository, AddressAutocompleteService],
  exports: [GeoService],
})
export class GeoModule {}
