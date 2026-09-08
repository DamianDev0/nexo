import { Module } from '@nestjs/common'
import { ActivitiesController } from './controllers/activities.controller'
import { ActivitiesService } from './services/activities.service'
import { ActivitiesRepository } from './repositories/activities.repository'
import { CommunicationListener } from './listeners/communication.listener'

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivitiesRepository, CommunicationListener],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
