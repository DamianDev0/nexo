import { Module } from '@nestjs/common'
import { BulkActionsController } from './controllers/bulk-actions.controller'
import { BulkActionsRepository } from './repositories/bulk-actions.repository'
import { BulkActionsService } from './services/bulk-actions.service'

@Module({
  controllers: [BulkActionsController],
  providers: [BulkActionsService, BulkActionsRepository],
})
export class BulkActionsModule {}
