import { Module } from '@nestjs/common'
import { DashboardController } from './controllers/dashboard.controller'
import { DashboardService } from './services/dashboard.service'
import { DashboardConfigService } from './services/dashboard-config.service'
import { DashboardRepository } from './repositories/dashboard.repository'
import { DashboardConfigRepository } from './repositories/dashboard-config.repository'

@Module({
  controllers: [DashboardController],
  providers: [
    DashboardService,
    DashboardConfigService,
    DashboardRepository,
    DashboardConfigRepository,
  ],
  exports: [DashboardService, DashboardConfigService],
})
export class DashboardModule {}
