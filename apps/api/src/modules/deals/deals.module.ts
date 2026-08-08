import { Module } from '@nestjs/common'
import { SettingsModule } from '@/modules/settings/settings.module'
import { CustomFieldsValidator } from '@/modules/settings/services/custom-fields-validator.service'
import { DealsController } from './controllers/deals.controller'
import { DealsService } from './services/deals.service'
import { DealItemsService } from './services/deal-items.service'
import { DealForecastService } from './services/deal-forecast.service'
import { DealsRepository } from './repositories/deals.repository'
import { DealItemsRepository } from './repositories/deal-items.repository'
import { CUSTOM_FIELDS_VALIDATOR } from './constants/deal.constants'

@Module({
  imports: [SettingsModule],
  controllers: [DealsController],
  providers: [
    DealsService,
    DealItemsService,
    DealForecastService,
    DealsRepository,
    DealItemsRepository,
    { provide: CUSTOM_FIELDS_VALIDATOR, useExisting: CustomFieldsValidator },
  ],
  exports: [DealsService],
})
export class DealsModule {}
