import { Module } from '@nestjs/common'
import { SavedFiltersController } from './controllers/saved-filters.controller'
import { SavedFiltersRepository } from './repositories/saved-filters.repository'
import { SavedFiltersService } from './services/saved-filters.service'

@Module({
  controllers: [SavedFiltersController],
  providers: [SavedFiltersService, SavedFiltersRepository],
  exports: [SavedFiltersService],
})
export class SavedFiltersModule {}
