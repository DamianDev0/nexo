import { Module } from '@nestjs/common'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { DashboardConfigService } from './dashboard-config.service'

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, DashboardConfigService],
  exports: [DashboardService, DashboardConfigService],
})
export class DashboardModule {}
