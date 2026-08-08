import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { DEFAULT_CONTACT_TAXONOMY, LifecycleStage } from '@repo/shared-types'
import type { ContactWorkspace, ContactTableState } from '@repo/shared-types'
import { CONTACT_COLUMN_CATALOG } from '../constants/contact-columns.catalog'
import { ContactViewsService } from './contact-views.service'
import { ContactsService } from './contacts.service'
import type { UpdateContactWorkspaceDto } from '../dto/contact-workspace.dto'
import { ContactWorkspaceRepository } from '../repositories/contact-workspace.repository'

@Injectable()
export class ContactWorkspaceService {
  constructor(
    private readonly db: TenantDbService,
    private readonly repository: ContactWorkspaceRepository,
    private readonly views: ContactViewsService,
    private readonly contacts: ContactsService,
  ) {}

  async getWorkspace(schemaName: string, userId: string): Promise<ContactWorkspace> {
    const [views, counts, state] = await Promise.all([
      this.views.findAll(schemaName, userId),
      this.contacts.counts(schemaName),
      this.repository.findState(schemaName, userId),
    ])

    const defaultView = views.find((view) => view.isDefault && view.ownerId === userId)
    const activeViewId =
      state?.active_view_id && views.some((view) => view.id === state.active_view_id)
        ? state.active_view_id
        : (defaultView?.id ?? null)

    return {
      views,
      activeViewId,
      tableState: (state?.table_state ?? {}) as ContactTableState,
      columns: [...CONTACT_COLUMN_CATALOG],
      quickFilters: {
        statuses: DEFAULT_CONTACT_TAXONOMY.statuses.map((option) => option.key),
        sources: DEFAULT_CONTACT_TAXONOMY.sources.map((option) => option.key),
        lifecycleStages: Object.values(LifecycleStage),
      },
      counts,
    }
  }

  async updateState(
    schemaName: string,
    userId: string,
    dto: UpdateContactWorkspaceDto,
  ): Promise<void> {
    await this.db.query(schemaName, async (qr) => {
      const existing = await this.repository.loadState(qr, userId)
      const activeViewId =
        dto.activeViewId === undefined ? (existing?.active_view_id ?? null) : dto.activeViewId
      const tableState = dto.tableState ?? existing?.table_state ?? {}

      await this.repository.upsertState(qr, userId, activeViewId, tableState)
    })
  }
}
