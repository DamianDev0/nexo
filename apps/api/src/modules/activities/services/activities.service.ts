import { Injectable, NotFoundException } from '@nestjs/common'
import { DOMAIN_EVENTS } from '@repo/shared-types'
import { EventBusService } from '@/shared/events/event-bus.service'
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service'
import { AuditAction, AuditEntityType } from '@/modules/audit-log/interfaces/audit-log.interfaces'
import type { ActivityListItem, CalendarActivity, PaginatedActivities } from '@repo/shared-types'
import { DEFAULT_PAGE_SIZE } from '@repo/shared-utils'
import type {
  CreateActivityDto,
  ActivityQueryDto,
  CalendarQueryDto,
  UpdateActivityDto,
} from '../dto/activity.dto'
import { UPDATABLE_FIELDS } from '../constants/activity.constants'
import { ActivitiesRepository } from '../repositories/activities.repository'
import { mapActivityListItem, mapCalendarActivity } from '../mappers/activity.mapper'

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly repository: ActivitiesRepository,
    private readonly audit: AuditLogService,
    private readonly eventBus: EventBusService,
  ) {}

  async findAll(schemaName: string, query: ActivityQueryDto): Promise<PaginatedActivities> {
    const page = query.page ?? 1
    const limit = query.limit ?? DEFAULT_PAGE_SIZE
    const offset = (page - 1) * limit

    const { rows, total } = await this.repository.findPage(schemaName, query, limit, offset)

    return { data: rows.map(mapActivityListItem), total, page, limit }
  }

  async findOne(schemaName: string, activityId: string): Promise<ActivityListItem> {
    const row = await this.repository.findListItemById(schemaName, activityId)
    if (!row) throw new NotFoundException(`Activity ${activityId} not found`)
    return mapActivityListItem(row)
  }

  async create(
    schemaName: string,
    dto: CreateActivityDto,
    createdById: string,
    completed = false,
  ): Promise<ActivityListItem> {
    const row = await this.repository.insert(schemaName, {
      activityType: dto.activityType,
      title: dto.title ?? null,
      description: dto.description ?? null,
      dueDate: dto.dueDate ?? null,
      durationMinutes: dto.durationMinutes ?? null,
      reminderAt: dto.reminderAt ?? null,
      priority: dto.priority ?? 'normal',
      contactId: dto.contactId ?? null,
      companyId: dto.companyId ?? null,
      dealId: dto.dealId ?? null,
      assignedToId: dto.assignedToId ?? createdById,
      createdById,
      completed,
    })

    void this.audit.entityEvent(
      schemaName,
      AuditAction.ActivityCreated,
      AuditEntityType.Activity,
      row.id,
      createdById,
      `Activity "${dto.activityType}" created`,
    )
    const result = mapActivityListItem(row)
    this.eventBus.emitCrm(DOMAIN_EVENTS.ACTIVITY_CREATED, {
      schemaName,
      entityType: 'activity',
      entityId: result.id,
      activity: result,
    })
    return result
  }

  async update(
    schemaName: string,
    activityId: string,
    dto: UpdateActivityDto,
  ): Promise<ActivityListItem> {
    const changes: Array<[string, unknown]> = []
    for (const [dtoKey, col] of UPDATABLE_FIELDS) {
      if (dto[dtoKey] !== undefined) {
        changes.push([col, dto[dtoKey]])
      }
    }

    const row = await this.repository.update(schemaName, activityId, changes)

    if (changes.length > 0) {
      void this.audit.entityEvent(
        schemaName,
        AuditAction.ActivityUpdated,
        AuditEntityType.Activity,
        activityId,
        undefined,
        `Activity ${activityId} updated`,
      )
    }
    return mapActivityListItem(row)
  }

  async remove(schemaName: string, activityId: string): Promise<void> {
    await this.repository.softDelete(schemaName, activityId)
    void this.audit.entityEvent(
      schemaName,
      AuditAction.ActivityDeleted,
      AuditEntityType.Activity,
      activityId,
      undefined,
      `Activity ${activityId} deleted`,
    )
  }

  async complete(schemaName: string, activityId: string): Promise<ActivityListItem> {
    const row = await this.repository.complete(schemaName, activityId)
    void this.audit.entityEvent(
      schemaName,
      AuditAction.ActivityCompleted,
      AuditEntityType.Activity,
      activityId,
      undefined,
      `Activity ${activityId} completed`,
    )
    const result = mapActivityListItem(row)
    this.eventBus.emitCrm(DOMAIN_EVENTS.ACTIVITY_COMPLETED, {
      schemaName,
      entityType: 'activity',
      entityId: activityId,
      activity: result,
    })
    return result
  }

  async cancel(schemaName: string, activityId: string): Promise<ActivityListItem> {
    const row = await this.repository.cancel(schemaName, activityId)
    return mapActivityListItem(row)
  }

  async reopen(schemaName: string, activityId: string): Promise<ActivityListItem> {
    const row = await this.repository.reopen(schemaName, activityId)
    return mapActivityListItem(row)
  }

  async getCalendar(schemaName: string, query: CalendarQueryDto): Promise<CalendarActivity[]> {
    const rows = await this.repository.findCalendar(schemaName, query.from, query.to, query.userId)
    return rows.map(mapCalendarActivity)
  }
}
