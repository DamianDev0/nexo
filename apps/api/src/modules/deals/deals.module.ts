import { Module } from '@nestjs/common'
import { SettingsModule } from '@/modules/settings/settings.module'
import { DealsService } from './deals.service'
import { DealsController } from './deals.controller'

@Module({
  imports: [SettingsModule],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}
