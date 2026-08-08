import { Module } from '@nestjs/common'
import { SettingsModule } from '@/modules/settings/settings.module'
import { CompaniesController } from './controllers/companies.controller'
import { CompaniesService } from './services/companies.service'
import { CompaniesRepository } from './repositories/companies.repository'

@Module({
  imports: [SettingsModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompaniesRepository],
  exports: [CompaniesService],
})
export class CompaniesModule {}
