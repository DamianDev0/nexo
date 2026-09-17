import { Injectable } from '@nestjs/common'
import {
  CUSTOM_COLUMN_PREFIX,
  OBJECT_CUSTOM_COLUMN_MIN_WIDTH,
  OBJECT_CUSTOM_COLUMN_WIDTH,
} from '@repo/shared-types'
import type { FieldDef, ObjectColumnDef, ObjectWorkspaceBase } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { UpdateObjectWorkspaceDto } from '../dto/object-workspace.dto'
import type { ObjectTableDefinition } from '../interfaces/object-definition.interfaces'
import {
  columnMinWidths,
  mergeTableState,
  sanitizeTableState,
} from '../mappers/object-table-state.mapper'
import { ObjectWorkspaceRepository } from '../repositories/object-workspace.repository'
import { ObjectViewsService } from './object-views.service'

function customColumnDef<TSortField extends string>(def: FieldDef): ObjectColumnDef<TSortField> {
  return {
    key: `${CUSTOM_COLUMN_PREFIX}${def.key}`,
    labelKey: '',
    hintKey: '',
    sortField: null,
    defaultVisible: false,
    defaultWidth: OBJECT_CUSTOM_COLUMN_WIDTH,
    minWidth: OBJECT_CUSTOM_COLUMN_MIN_WIDTH,
    custom: true,
    label: def.label,
    fieldType: def.type,
    fieldOptions: def.options,
  }
}

@Injectable()
export class ObjectWorkspaceService {
  constructor(
    private readonly db: TenantDbService,
    private readonly repository: ObjectWorkspaceRepository,
    private readonly views: ObjectViewsService,
  ) {}

  async getWorkspace<TSortField extends string>(
    schemaName: string,
    definition: ObjectTableDefinition<TSortField>,
    userId: string,
    customFields: ReadonlyArray<FieldDef> = [],
  ): Promise<ObjectWorkspaceBase<TSortField>> {
    const [views, state] = await Promise.all([
      this.views.findAll(schemaName, definition, userId),
      this.repository.findState(schemaName, definition.type, userId),
    ])

    const defaultView = views.find((view) => view.isDefault && view.ownerId === userId)
    const activeViewId =
      state?.active_view_id && views.some((view) => view.id === state.active_view_id)
        ? state.active_view_id
        : (defaultView?.id ?? null)

    return {
      views,
      activeViewId,
      tableState: sanitizeTableState(state?.table_state, columnMinWidths(definition.columns)),
      columns: [
        ...definition.columns,
        ...customFields.map((def) => customColumnDef<TSortField>(def)),
      ],
    }
  }

  async updateState(
    schemaName: string,
    definition: ObjectTableDefinition,
    userId: string,
    dto: UpdateObjectWorkspaceDto,
  ): Promise<void> {
    const { type } = definition
    await this.db.transactional(schemaName, async (qr) => {
      await this.repository.lockUser(qr, type, userId)
      const existing = await this.repository.loadState(qr, type, userId)
      const activeViewId =
        dto.activeViewId === undefined ? (existing?.active_view_id ?? null) : dto.activeViewId

      await this.repository.upsertState(
        qr,
        type,
        userId,
        activeViewId,
        mergeTableState(existing?.table_state, dto.tableState, columnMinWidths(definition.columns)),
      )
    })
  }
}
