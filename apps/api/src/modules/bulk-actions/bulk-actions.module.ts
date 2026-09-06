import { Module } from '@nestjs/common'
import { BulkActionsController } from './controllers/bulk-actions.controller'
import { ArchiveHandler } from './handlers/archive.handler'
import { AssignHandler } from './handlers/assign.handler'
import { BULK_ACTION_HANDLERS } from './handlers/bulk-action-handler.interface'
import { ExportHandler } from './handlers/export.handler'
import { RevertHandler } from './handlers/revert.handler'
import { SendMessageHandler } from './handlers/send-message.handler'
import { TagsHandler } from './handlers/tags.handler'
import { UpdateFieldHandler } from './handlers/update-field.handler'
import { BulkActionsProcessor } from './processors/bulk-actions.processor'
import { BulkActionsRepository } from './repositories/bulk-actions.repository'
import { BulkSnapshotsRepository } from './repositories/bulk-snapshots.repository'
import { BulkTargetsRepository } from './repositories/bulk-targets.repository'
import { BulkActionRunnerService } from './services/bulk-action-runner.service'
import { BulkActionsService } from './services/bulk-actions.service'

const HANDLERS = [
  TagsHandler,
  AssignHandler,
  ArchiveHandler,
  UpdateFieldHandler,
  SendMessageHandler,
  ExportHandler,
  RevertHandler,
]

@Module({
  controllers: [BulkActionsController],
  providers: [
    BulkActionsService,
    BulkActionRunnerService,
    BulkActionsRepository,
    BulkSnapshotsRepository,
    BulkTargetsRepository,
    BulkActionsProcessor,
    ...HANDLERS,
    {
      provide: BULK_ACTION_HANDLERS,
      inject: HANDLERS,
      useFactory: (...handlers: unknown[]) => handlers,
    },
  ],
})
export class BulkActionsModule {}
