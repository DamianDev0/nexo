import { Injectable, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  ActivityInsertValues,
  ActivityListFilters,
  ActivityListPage,
  ActivityListRow,
  CalendarRow,
} from '../interfaces/activity-row.interfaces'
import {
  ACTIVITY_LIST_COLUMNS,
  ACTIVITY_LIST_FROM,
  CALENDAR_COLUMNS,
  CALENDAR_FROM,
  DUE_FILTER_SQL,
} from '../constants/activity.constants'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class ActivitiesRepository {
  constructor(private readonly db: TenantDbService) {}

  async findPage(
    schemaName: string,
    filters: ActivityListFilters,
    limit: number,
    offset: number,
  ): Promise<ActivityListPage> {
    return this.db.query(schemaName, async (qr): Promise<ActivityListPage> => {
      const { where, params } = this.buildWhereClause(filters)

      const countRows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count ${ACTIVITY_LIST_FROM} WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const dataParams = [...params, limit, offset]
      const rows = await sqlRows<ActivityListRow[]>(
        qr,
        `SELECT ${ACTIVITY_LIST_COLUMNS}
         ${ACTIVITY_LIST_FROM}
         WHERE ${where}
         ORDER BY a.due_date ASC NULLS LAST, a.created_at DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { rows, total }
    })
  }

  async findListItemById(schemaName: string, activityId: string): Promise<ActivityListRow | null> {
    return this.db.query(schemaName, async (qr): Promise<ActivityListRow | null> => {
      const rows = await sqlRows<ActivityListRow[]>(
        qr,
        `SELECT ${ACTIVITY_LIST_COLUMNS}
         ${ACTIVITY_LIST_FROM}
         WHERE a.id = $1 AND a.is_active = true`,
        [activityId],
      )

      return rows[0] ?? null
    })
  }

  async insert(schemaName: string, values: ActivityInsertValues): Promise<ActivityListRow> {
    return this.db.query(schemaName, async (qr): Promise<ActivityListRow> => {
      const insertRows = await sqlRows<[{ id: string }]>(
        qr,
        `INSERT INTO activities (
           activity_type, title, description, due_date,
           duration_minutes, reminder_at,
           contact_id, company_id, deal_id, assigned_to_id, created_by,
           status, completed_at, priority
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
           CASE WHEN $12::boolean THEN 'completed' ELSE 'pending' END,
           CASE WHEN $12::boolean THEN NOW() END,
           $13)
         RETURNING id`,
        [
          values.activityType,
          values.title,
          values.description,
          values.dueDate,
          values.durationMinutes,
          values.reminderAt,
          values.contactId,
          values.companyId,
          values.dealId,
          values.assignedToId,
          values.createdById,
          values.completed,
          values.priority,
        ],
      )

      return this.fetchActivityOrFail(qr, insertRows[0].id)
    })
  }

  async update(
    schemaName: string,
    activityId: string,
    changes: Array<[string, unknown]>,
  ): Promise<ActivityListRow> {
    return this.db.query(schemaName, async (qr): Promise<ActivityListRow> => {
      await this.assertActivityExists(qr, activityId)

      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      for (const [col, value] of changes) {
        params.push(value)
        sets.push(`${col} = $${params.length}`)
      }

      if (sets.length === 1) {
        return this.fetchActivityOrFail(qr, activityId)
      }

      params.push(activityId)
      await qr.query(
        `UPDATE activities SET ${sets.join(', ')} WHERE id = $${params.length} AND is_active = true`,
        params,
      )

      return this.fetchActivityOrFail(qr, activityId)
    })
  }

  async softDelete(schemaName: string, activityId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      await this.assertActivityExists(qr, activityId)
      await qr.query(`UPDATE activities SET is_active = false, updated_at = NOW() WHERE id = $1`, [
        activityId,
      ])
    })
  }

  async complete(schemaName: string, activityId: string): Promise<ActivityListRow> {
    return this.db.query(schemaName, async (qr): Promise<ActivityListRow> => {
      await this.assertActivityExists(qr, activityId)

      await qr.query(
        `UPDATE activities
         SET status = 'completed', completed_at = NOW(), updated_at = NOW()
         WHERE id = $1 AND is_active = true`,
        [activityId],
      )

      return this.fetchActivityOrFail(qr, activityId)
    })
  }

  async cancel(schemaName: string, activityId: string): Promise<ActivityListRow> {
    return this.db.query(schemaName, async (qr): Promise<ActivityListRow> => {
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

  async reopen(schemaName: string, activityId: string): Promise<ActivityListRow> {
    return this.db.query(schemaName, async (qr): Promise<ActivityListRow> => {
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

  async findCalendar(
    schemaName: string,
    from: string,
    to: string,
    userId?: string,
  ): Promise<CalendarRow[]> {
    return this.db.query(schemaName, async (qr): Promise<CalendarRow[]> => {
      const params: unknown[] = [from, to]
      let userFilter = ''

      if (userId) {
        params.push(userId)
        userFilter = ` AND a.assigned_to_id = $${params.length}`
      }

      const rows = await sqlRows<CalendarRow[]>(
        qr,
        `SELECT ${CALENDAR_COLUMNS}
         ${CALENDAR_FROM}
         WHERE a.is_active = true
           AND a.due_date >= $1
           AND a.due_date <= $2
           ${userFilter}
         ORDER BY a.due_date ASC`,
        params,
      )

      return rows
    })
  }

  private async fetchActivityOrFail(qr: QueryRunner, activityId: string): Promise<ActivityListRow> {
    const rows = await sqlRows<ActivityListRow[]>(
      qr,
      `SELECT ${ACTIVITY_LIST_COLUMNS}
       ${ACTIVITY_LIST_FROM}
       WHERE a.id = $1 AND a.is_active = true`,
      [activityId],
    )

    const row = rows[0]
    if (!row) throw new NotFoundException(`Activity ${activityId} not found`)
    return row
  }

  private async assertActivityExists(qr: QueryRunner, activityId: string): Promise<void> {
    const rows = await sqlRows<[{ id: string }?]>(
      qr,
      `SELECT id FROM activities WHERE id = $1 AND is_active = true`,
      [activityId],
    )

    if (rows.length === 0) {
      throw new NotFoundException(`Activity ${activityId} not found`)
    }
  }

  private buildWhereClause(filters: ActivityListFilters): { where: string; params: unknown[] } {
    const conditions: string[] = ['a.is_active = true']
    const params: unknown[] = []

    if (filters.activityType) {
      params.push(filters.activityType)
      conditions.push(`a.activity_type = $${params.length}`)
    }

    if (filters.status) {
      params.push(filters.status)
      conditions.push(`a.status = $${params.length}`)
    }

    if (filters.due) conditions.push(DUE_FILTER_SQL[filters.due])

    if (filters.contactId) {
      params.push(filters.contactId)
      conditions.push(`a.contact_id = $${params.length}`)
    }

    if (filters.companyId) {
      params.push(filters.companyId)
      conditions.push(`a.company_id = $${params.length}`)
    }

    if (filters.dealId) {
      params.push(filters.dealId)
      conditions.push(`a.deal_id = $${params.length}`)
    }

    if (filters.assignedToId) {
      params.push(filters.assignedToId)
      conditions.push(`a.assigned_to_id = $${params.length}`)
    }

    return { where: conditions.join(' AND '), params }
  }
}
