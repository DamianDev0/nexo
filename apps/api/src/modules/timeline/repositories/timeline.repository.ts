import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { TimelinePageResult, TimelineRow } from '../interfaces/timeline-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class TimelineRepository {
  constructor(private readonly db: TenantDbService) {}

  async findTimelinePage(
    schemaName: string,
    filterCol: string,
    filterId: string,
    limit: number,
    offset: number,
  ): Promise<TimelinePageResult> {
    return this.db.query(schemaName, async (qr): Promise<TimelinePageResult> => {
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

      const countRows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM (${unionQuery}) t`,
        [filterId],
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const rows = await sqlRows<TimelineRow[]>(
        qr,
        `SELECT * FROM (${unionQuery}) t ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [filterId, limit, offset],
      )

      return { rows, total }
    })
  }
}
