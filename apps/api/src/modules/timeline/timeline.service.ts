import { Injectable } from '@nestjs/common'
import type { PaginatedTimeline, TimelineEntry, TimelineEventType } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'

interface TimelineRow {
  id: string
  event_type: string
  title: string
  description: string | null
  entity_type: string | null
  entity_id: string | null
  user_id: string | null
  user_name: string | null
  metadata: Record<string, unknown>
  created_at: string
}

@Injectable()
export class TimelineService {
  constructor(private readonly db: TenantDbService) {}

  async getContactTimeline(
    schemaName: string,
    contactId: string,
    page = 1,
    limit = 25,
  ): Promise<PaginatedTimeline> {
    return this.getTimeline(schemaName, 'contact_id', contactId, page, limit)
  }

  async getDealTimeline(
    schemaName: string,
    dealId: string,
    page = 1,
    limit = 25,
  ): Promise<PaginatedTimeline> {
    return this.getTimeline(schemaName, 'deal_id', dealId, page, limit)
  }

  async getCompanyTimeline(
    schemaName: string,
    companyId: string,
    page = 1,
    limit = 25,
  ): Promise<PaginatedTimeline> {
    return this.getTimeline(schemaName, 'company_id', companyId, page, limit)
  }

  private async getTimeline(
    schemaName: string,
    filterCol: string,
    filterId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedTimeline> {
    return this.db.query(schemaName, async (qr): Promise<PaginatedTimeline> => {
      const offset = (page - 1) * limit

      const unionQuery = `
        SELECT
          a.id, a.activity_type AS event_type,
          COALESCE(a.title, a.activity_type) AS title,
          a.description,
          'activity' AS entity_type, a.id AS entity_id,
          a.created_by AS user_id,
          COALESCE(u.full_name, u.email) AS user_name,
          '{}'::jsonb AS metadata,
          a.created_at
        FROM activities a
        LEFT JOIN users u ON u.id = a.created_by
        WHERE a.${filterCol} = $1 AND a.is_active = true

        UNION ALL

        SELECT
          d.id, CASE d.status WHEN 'won' THEN 'deal_won' WHEN 'lost' THEN 'deal_lost' ELSE 'deal_created' END AS event_type,
          d.title,
          NULL AS description,
          'deal' AS entity_type, d.id AS entity_id,
          d.created_by AS user_id,
          COALESCE(u.full_name, u.email) AS user_name,
          jsonb_build_object('valueCents', d.value_cents, 'status', d.status) AS metadata,
          d.created_at
        FROM deals d
        LEFT JOIN users u ON u.id = d.created_by
        WHERE ${filterCol === 'deal_id' ? 'd.id' : `d.${filterCol}`} = $1 AND d.is_active = true

        UNION ALL

        SELECT
          n.id, n.notification_type AS event_type,
          n.title,
          n.body AS description,
          n.entity_type, n.entity_id,
          n.user_id,
          NULL AS user_name,
          '{}'::jsonb AS metadata,
          n.created_at
        FROM notifications n
        WHERE n.entity_id = $1
      `

      const countRows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count FROM (${unionQuery}) t`,
        [filterId],
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const rows: TimelineRow[] = await qr.query(
        `SELECT * FROM (${unionQuery}) t ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [filterId, limit, offset],
      )

      return {
        data: rows.map(
          (r): TimelineEntry => ({
            id: r.id,
            eventType: r.event_type as TimelineEventType,
            title: r.title,
            description: r.description,
            entityType: r.entity_type,
            entityId: r.entity_id,
            userId: r.user_id,
            userName: r.user_name,
            metadata: r.metadata ?? {},
            createdAt: r.created_at,
          }),
        ),
        total,
        page,
        limit,
      }
    })
  }
}
