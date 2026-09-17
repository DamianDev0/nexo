import { Module } from '@nestjs/common'
import { ObjectViewsRepository } from './repositories/object-views.repository'
import { ObjectWorkspaceRepository } from './repositories/object-workspace.repository'
import { ObjectViewsService } from './services/object-views.service'
import { ObjectWorkspaceService } from './services/object-workspace.service'

@Module({
  providers: [
    ObjectViewsRepository,
    ObjectWorkspaceRepository,
    ObjectViewsService,
    ObjectWorkspaceService,
  ],
  exports: [ObjectViewsService, ObjectWorkspaceService],
})
export class ObjectEngineModule {}
