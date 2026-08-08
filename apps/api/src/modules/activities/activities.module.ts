import { Module } from '@nestjs/common'
import { ActivitiesController } from './controllers/activities.controller'
import { ActivitiesService } from './services/activities.service'
import { ActivitiesRepository } from './repositories/activities.repository'

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivitiesRepository],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
