import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  CountRow,
  DealMetricsRow,
  MetricsQueryResult,
  MetricsRow,
  OverdueInvoiceRow,
  PipelineStageSummaryRow,
  RevenueByMonthRow,
  TodayActivityRow,
  TopSalesRepRow,
} from '../interfaces/dashboard-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class DashboardRepository {
  constructor(private readonly db: TenantDbService) {}

  async findMetrics(schemaName: string): Promise<MetricsQueryResult> {
    return this.db.query(schemaName, async (qr): Promise<MetricsQueryResult> => {
      const rows = await sqlRows<MetricsRow[]>(
        qr,
        `
        SELECT
          COALESCE(SUM(CASE WHEN i.status IN ('sent','approved') THEN i.total_cents ELSE 0 END), 0)::text AS total_receivable_cents,
          COALESCE(SUM(CASE WHEN i.status IN ('sent','approved') AND i.due_date < CURRENT_DATE THEN i.total_cents ELSE 0 END), 0)::text AS total_overdue_cents,
          COALESCE(SUM(CASE WHEN i.status = 'approved' AND i.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN i.total_cents ELSE 0 END), 0)::text AS invoiced_this_month_cents,
          COALESCE(COUNT(CASE WHEN i.status = 'approved' AND i.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END), 0)::text AS invoiced_this_month_count
        FROM invoices i
      `,
      )

      const dealRows = await sqlRows<[DealMetricsRow]>(
        qr,
        `
        SELECT
          COUNT(CASE WHEN status = 'open' AND is_active = true THEN 1 END)::text AS active_count,
          COALESCE(SUM(CASE WHEN status = 'open' AND is_active = true THEN value_cents ELSE 0 END), 0)::text AS active_value,
          COUNT(CASE WHEN status = 'won' AND updated_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)::text AS won_count,
          COALESCE(SUM(CASE WHEN status = 'won' AND updated_at >= DATE_TRUNC('month', CURRENT_DATE) THEN value_cents ELSE 0 END), 0)::text AS won_value
        FROM deals
      `,
      )

      const contactRows = await sqlRows<[CountRow]>(
        qr,
        `
        SELECT COUNT(*)::text AS count FROM contacts
        WHERE is_active = true AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `,
      )

      const activityRows = await sqlRows<[CountRow]>(
        qr,
        `
        SELECT COUNT(*)::text AS count FROM activities
        WHERE is_active = true AND status = 'pending'
      `,
      )

      return {
        invoices: rows[0]!,
        deals: dealRows[0],
        newContacts: contactRows[0],
        pendingActivities: activityRows[0],
      }
    })
  }

  async findPipelineSummaryRows(schemaName: string): Promise<PipelineStageSummaryRow[]> {
    return this.db.query(schemaName, async (qr): Promise<PipelineStageSummaryRow[]> => {
      return sqlRows<PipelineStageSummaryRow[]>(
        qr,
        `
        SELECT
          p.id AS pipeline_id, p.name AS pipeline_name,
          ps.id AS stage_id, ps.name AS stage_name,
          ps.color AS stage_color, ps.position AS stage_position,
          COUNT(d.id)::text AS deal_count,
          COALESCE(SUM(d.value_cents), 0)::text AS total_value_cents
        FROM pipelines p
        JOIN pipeline_stages ps ON ps.pipeline_id = p.id
        LEFT JOIN deals d ON d.stage_id = ps.id AND d.is_active = true AND d.status = 'open'
        GROUP BY p.id, p.name, ps.id, ps.name, ps.color, ps.position
        ORDER BY p.name, ps.position
      `,
      )
    })
  }

  async findTodayActivityRows(schemaName: string, userId: string): Promise<TodayActivityRow[]> {
    return this.db.query(schemaName, async (qr): Promise<TodayActivityRow[]> => {
      return sqlRows<TodayActivityRow[]>(
        qr,
        `
        SELECT
          a.id, a.activity_type, a.title, a.due_date, a.status,
          COALESCE(c.first_name || ' ' || c.last_name, c.first_name) AS contact_name,
          d.title AS deal_title
        FROM activities a
        LEFT JOIN contacts c ON c.id = a.contact_id
        LEFT JOIN deals d ON d.id = a.deal_id
        WHERE a.is_active = true
          AND a.status = 'pending'
          AND a.assigned_to_id = $1
          AND a.due_date::date = CURRENT_DATE
        ORDER BY a.due_date ASC
      `,
        [userId],
      )
    })
  }

  async findOverdueInvoiceRows(schemaName: string, limit: number): Promise<OverdueInvoiceRow[]> {
    return this.db.query(schemaName, async (qr): Promise<OverdueInvoiceRow[]> => {
      return sqlRows<OverdueInvoiceRow[]>(
        qr,
        `
        SELECT
          i.id, i.invoice_number,
          co.name AS company_name,
          COALESCE(c.first_name || ' ' || c.last_name, c.first_name) AS contact_name,
          i.total_cents::text,
          i.due_date::text,
          (CURRENT_DATE - i.due_date)::text AS days_overdue
        FROM invoices i
        LEFT JOIN companies co ON co.id = i.company_id
        LEFT JOIN contacts c ON c.id = i.contact_id
        WHERE i.status IN ('sent', 'approved')
          AND i.due_date < CURRENT_DATE
        ORDER BY i.due_date ASC
        LIMIT $1
      `,
        [limit],
      )
    })
  }

  async findTopSalesRepRows(schemaName: string, limit: number): Promise<TopSalesRepRow[]> {
    return this.db.query(schemaName, async (qr): Promise<TopSalesRepRow[]> => {
      return sqlRows<TopSalesRepRow[]>(
        qr,
        `
        SELECT
          u.id AS user_id,
          COALESCE(u.full_name, u.email) AS user_name,
          COUNT(d.id)::text AS won_deals_count,
          COALESCE(SUM(d.value_cents), 0)::text AS total_value_cents
        FROM deals d
        JOIN users u ON u.id = d.assigned_to_id
        WHERE d.status = 'won'
          AND d.updated_at >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY u.id, u.full_name, u.email
        ORDER BY total_value_cents DESC
        LIMIT $1
      `,
        [limit],
      )
    })
  }

  async findRevenueByMonthRows(schemaName: string, months: number): Promise<RevenueByMonthRow[]> {
    return this.db.query(schemaName, async (qr): Promise<RevenueByMonthRow[]> => {
      return sqlRows<RevenueByMonthRow[]>(
        qr,
        `
        SELECT
          TO_CHAR(gs.month, 'YYYY-MM') AS month,
          COALESCE(SUM(CASE WHEN i.status = 'approved' THEN i.total_cents ELSE 0 END), 0)::text AS invoiced_cents,
          COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_cents ELSE 0 END), 0)::text AS paid_cents,
          COUNT(DISTINCT d.id)::text AS deal_count
        FROM generate_series(
          DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' * ($1 - 1),
          DATE_TRUNC('month', CURRENT_DATE),
          '1 month'
        ) AS gs(month)
        LEFT JOIN invoices i ON DATE_TRUNC('month', i.created_at) = gs.month
        LEFT JOIN deals d ON d.status = 'won' AND DATE_TRUNC('month', d.updated_at) = gs.month
        GROUP BY gs.month
        ORDER BY gs.month ASC
      `,
        [months],
      )
    })
  }
}
