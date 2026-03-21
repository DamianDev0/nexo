import { Module } from '@nestjs/common'
import { BulkActionsController } from './bulk-actions.controller'
import { BulkActionsService } from './bulk-actions.service'

@Module({
  controllers: [BulkActionsController],
  providers: [BulkActionsService],
})
export class BulkActionsModule {}
