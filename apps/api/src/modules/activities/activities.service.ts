import { Injectable, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { AuditLogService } from '@/shared/audit-log/audit-log.service'
import { AuditAction, AuditEntityType } from '@/shared/audit-log/audit-log.interfaces'
import type {
  Activity,
  ActivityListItem,
  ActivityStatus,
  CalendarActivity,
  PaginatedActivities,
} from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  CreateActivityDto,
  ActivityQueryDto,
  CalendarQueryDto,
  UpdateActivityDto,
} from './dto/activity.dto'
import type {
  ActivityListRow,
  ActivityRow,
  CalendarRow,
} from './interfaces/activity-row.interfaces'
import {
  ACTIVITY_LIST_COLUMNS,
  ACTIVITY_LIST_FROM,
  CALENDAR_COLUMNS,
  CALENDAR_FROM,
  UPDATABLE_FIELDS,
} from './constants/activity.constants'

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly db: TenantDbService,
    private readonly audit: AuditLogService,
  ) {}

  // ─── List ─────────────────────────────────────────────────────────────────

  async findAll(schemaName: string, query: ActivityQueryDto): Promise<PaginatedActivities> {
    return this.db.query(schemaName, async (qr): Promise<PaginatedActivities> => {
      const page = query.page ?? 1
      const limit = query.limit ?? 25
      const offset = (page - 1) * limit

      const { where, params } = this.buildWhereClause(query)

      const countRows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count ${ACTIVITY_LIST_FROM} WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const dataParams = [...params, limit, offset]
      const rows: ActivityListRow[] = await qr.query(
        `SELECT ${ACTIVITY_LIST_COLUMNS}
         ${ACTIVITY_LIST_FROM}
         WHERE ${where}
         ORDER BY a.due_date ASC NULLS LAST, a.created_at DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { data: rows.map((r) => this.mapListItem(r)), total, page, limit }
    })
  }

  // ─── Find one ─────────────────────────────────────────────────────────────

  async findOne(schemaName: string, activityId: string): Promise<ActivityListItem> {
    return this.db.query(schemaName, async (qr): Promise<ActivityListItem> => {
      const rows: ActivityListRow[] = await qr.query(
        `SELECT ${ACTIVITY_LIST_COLUMNS}
         ${ACTIVITY_LIST_FROM}
         WHERE a.id = $1 AND a.is_active = true`,
        [activityId],
      )

      const row = rows[0]
      if (!row) throw new NotFoundException(`Activity ${activityId} not found`)
      return this.mapListItem(row)
    })
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(
    schemaName: string,
    dto: CreateActivityDto,
    createdById: string,
  ): Promise<ActivityListItem> {
    return this.db.query(schemaName, async (qr): Promise<ActivityListItem> => {
      const insertRows: [{ id: string }] = await qr.query(
        `INSERT INTO activities (
           activity_type, title, description, due_date,
           duration_minutes, reminder_at,
           contact_id, company_id, deal_id, assigned_to_id, created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [
          dto.activityType,
          dto.title ?? null,
          dto.description ?? null,
          dto.dueDate ?? null,
          dto.durationMinutes ?? null,
          dto.reminderAt ?? null,
          dto.contactId ?? null,
          dto.companyId ?? null,
          dto.dealId ?? null,
          dto.assignedToId ?? createdById,
          createdById,
        ],
      )

      const result = await this.fetchActivityOrFail(qr, insertRows[0].id)
      void this.audit.entityEvent(
        schemaName,
        AuditAction.ActivityCreated,
        AuditEntityType.Activity,
        result.id,
        createdById,
        `Activity "${dto.activityType}" created`,
      )
      return result
    })
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(
    schemaName: string,
    activityId: string,
    dto: UpdateActivityDto,
  ): Promise<ActivityListItem> {
    return this.db.query(schemaName, async (qr): Promise<ActivityListItem> => {
      await this.assertActivityExists(qr, activityId)

      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      for (const [dtoKey, col] of UPDATABLE_FIELDS) {
        if (dto[dtoKey] !== undefined) {
          params.push(dto[dtoKey])
          sets.push(`${col} = $${params.length}`)
        }
      }

      if (sets.length === 1) {
        return this.fetchActivityOrFail(qr, activityId)
      }

      params.push(activityId)
      await qr.query(
        `UPDATE activities SET ${sets.join(', ')} WHERE id = $${params.length} AND is_active = true`,
        params,
      )

      const result = await this.fetchActivityOrFail(qr, activityId)
      void this.audit.entityEvent(
        schemaName,
        AuditAction.ActivityUpdated,
        AuditEntityType.Activity,
        activityId,
        undefined,
        `Activity ${activityId} updated`,
      )
      return result
    })
  }

  // ─── Delete (soft) ────────────────────────────────────────────────────────

  async remove(schemaName: string, activityId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      await this.assertActivityExists(qr, activityId)
      await qr.query(`UPDATE activities SET is_active = false, updated_at = NOW() WHERE id = $1`, [
        activityId,
      ])
      void this.audit.entityEvent(
        schemaName,
        AuditAction.ActivityDeleted,
        AuditEntityType.Activity,
        activityId,
        undefined,
        `Activity ${activityId} deleted`,
      )
    })
  }

  // ─── Complete ─────────────────────────────────────────────────────────────

  async complete(schemaName: string, activityId: string): Promise<ActivityListItem> {
    return this.db.query(schemaName, async (qr): Promise<ActivityListItem> => {
      await this.assertActivityExists(qr, activityId)

      await qr.query(
        `UPDATE activities
         SET status = 'completed', completed_at = NOW(), updated_at = NOW()
         WHERE id = $1 AND is_active = true`,
        [activityId],
      )

      const result = await this.fetchActivityOrFail(qr, activityId)
      void this.audit.entityEvent(
        schemaName,
        AuditAction.ActivityCompleted,
        AuditEntityType.Activity,
        activityId,
        undefined,
        `Activity ${activityId} completed`,
      )
      return result
    })
  }

  // ─── Cancel ───────────────────────────────────────────────────────────────

  async cancel(schemaName: string, activityId: string): Promise<ActivityListItem> {
    return this.db.query(schemaName, async (qr): Promise<ActivityListItem> => {
      await this.assertActivityExists(qr, activityId)

      await qr.query(
        `UPDATE activities
         SET status = 'cancelled', updated_at = NOW()
         WHERE id = $1 AND is_active = true`,
        [activityId],
      )

      return this.fetchActivityOrFail(qr, activityId)
    })
  }

  // ─── Reopen ───────────────────────────────────────────────────────────────

  async reopen(schemaName: string, activityId: string): Promise<ActivityListItem> {
    return this.db.query(schemaName, async (qr): Promise<ActivityListItem> => {
      await this.assertActivityExists(qr, activityId)

      await qr.query(
        `UPDATE activities
         SET status = 'pending', completed_at = NULL, updated_at = NOW()
         WHERE id = $1 AND is_active = true`,
        [activityId],
      )

      return this.fetchActivityOrFail(qr, activityId)
    })
  }

  // ─── Calendar ─────────────────────────────────────────────────────────────

  async getCalendar(schemaName: string, query: CalendarQueryDto): Promise<CalendarActivity[]> {
    return this.db.query(schemaName, async (qr): Promise<CalendarActivity[]> => {
      const params: unknown[] = [query.from, query.to]
      let userFilter = ''

      if (query.userId) {
        params.push(query.userId)
        userFilter = ` AND a.assigned_to_id = $${params.length}`
      }

      const rows: CalendarRow[] = await qr.query(
        `SELECT ${CALENDAR_COLUMNS}
         ${CALENDAR_FROM}
         WHERE a.is_active = true
           AND a.due_date >= $1
           AND a.due_date <= $2
           ${userFilter}
         ORDER BY a.due_date ASC`,
        params,
      )

      return rows.map(
        (r): CalendarActivity => ({
          id: r.id,
          activityType: r.activity_type,
          title: r.title,
          dueDate: r.due_date,
          status: r.status as ActivityStatus,
          contactName: r.contact_name,
          dealTitle: r.deal_title,
          assignedToId: r.assigned_to_id,
        }),
      )
    })
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async fetchActivityOrFail(
    qr: QueryRunner,
    activityId: string,
  ): Promise<ActivityListItem> {
    const rows: ActivityListRow[] = await qr.query(
      `SELECT ${ACTIVITY_LIST_COLUMNS}
       ${ACTIVITY_LIST_FROM}
       WHERE a.id = $1 AND a.is_active = true`,
      [activityId],
    )

    const row = rows[0]
    if (!row) throw new NotFoundException(`Activity ${activityId} not found`)
    return this.mapListItem(row)
  }

  private async assertActivityExists(qr: QueryRunner, activityId: string): Promise<void> {
    const rows: [{ id: string }?] = await qr.query(
      `SELECT id FROM activities WHERE id = $1 AND is_active = true`,
      [activityId],
    )

    if (rows.length === 0) {
      throw new NotFoundException(`Activity ${activityId} not found`)
    }
  }

  private buildWhereClause(query: ActivityQueryDto): { where: string; params: unknown[] } {
    const conditions: string[] = ['a.is_active = true']
    const params: unknown[] = []

    if (query.activityType) {
      params.push(query.activityType)
      conditions.push(`a.activity_type = $${params.length}`)
    }

    if (query.status) {
      params.push(query.status)
      conditions.push(`a.status = $${params.length}`)
    }

    if (query.contactId) {
      params.push(query.contactId)
      conditions.push(`a.contact_id = $${params.length}`)
    }

    if (query.companyId) {
      params.push(query.companyId)
      conditions.push(`a.company_id = $${params.length}`)
    }

    if (query.dealId) {
      params.push(query.dealId)
      conditions.push(`a.deal_id = $${params.length}`)
    }

    if (query.assignedToId) {
      params.push(query.assignedToId)
      conditions.push(`a.assigned_to_id = $${params.length}`)
    }

    return { where: conditions.join(' AND '), params }
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  private mapActivity(r: ActivityRow): Activity {
    return {
      id: r.id,
      activityType: r.activity_type,
      title: r.title,
      description: r.description,
      dueDate: r.due_date,
      completedAt: r.completed_at,
      status: r.status as ActivityStatus,
      durationMinutes: r.duration_minutes,
      reminderAt: r.reminder_at,
      isActive: r.is_active,
      contactId: r.contact_id,
      companyId: r.company_id,
      dealId: r.deal_id,
      assignedToId: r.assigned_to_id,
      createdById: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }

  private mapListItem(r: ActivityListRow): ActivityListItem {
    return {
      ...this.mapActivity(r),
      contactName: r.contact_name,
      companyName: r.company_name,
      dealTitle: r.deal_title,
      assignedToName: r.assigned_to_name,
    }
  }
}
