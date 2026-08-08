import { Module } from '@nestjs/common'
import { TimelineController } from './controllers/timeline.controller'
import { TimelineService } from './services/timeline.service'
import { TimelineRepository } from './repositories/timeline.repository'

@Module({
  controllers: [TimelineController],
  providers: [TimelineService, TimelineRepository],
  exports: [TimelineService],
})
export class TimelineModule {}
