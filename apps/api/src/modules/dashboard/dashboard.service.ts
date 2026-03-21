import { Injectable } from '@nestjs/common'
import type {
  DashboardMetrics,
  OverdueInvoice,
  PipelineSummary,
  RevenueByMonth,
  TodayActivity,
  TopSalesRep,
} from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { CacheService } from '@/shared/cache/cache.service'
import type {
  MetricsRow,
  OverdueInvoiceRow,
  PipelineStageSummaryRow,
  RevenueByMonthRow,
  TodayActivityRow,
  TopSalesRepRow,
} from './interfaces/dashboard-row.interfaces'

const CACHE_TTL = 300

@Injectable()
export class DashboardService {
  constructor(
    private readonly db: TenantDbService,
    private readonly cache: CacheService,
  ) {}

  async getMetrics(schemaName: string, tenantId: string): Promise<DashboardMetrics> {
    const cacheKey = `dashboard:metrics:${tenantId}`
    const cached = await this.cache.get<DashboardMetrics>(cacheKey)
    if (cached) return cached

    const metrics = await this.db.query(schemaName, async (qr): Promise<DashboardMetrics> => {
      const rows: MetricsRow[] = await qr.query(`
        SELECT
          COALESCE(SUM(CASE WHEN i.status IN ('sent','approved') THEN i.total_cents ELSE 0 END), 0)::text AS total_receivable_cents,
          COALESCE(SUM(CASE WHEN i.status IN ('sent','approved') AND i.due_date < CURRENT_DATE THEN i.total_cents ELSE 0 END), 0)::text AS total_overdue_cents,
          COALESCE(SUM(CASE WHEN i.status = 'approved' AND i.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN i.total_cents ELSE 0 END), 0)::text AS invoiced_this_month_cents,
          COALESCE(COUNT(CASE WHEN i.status = 'approved' AND i.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END), 0)::text AS invoiced_this_month_count
        FROM invoices i
      `)

      const dealRows: [
        { active_count: string; active_value: string; won_count: string; won_value: string },
      ] = await qr.query(`
        SELECT
          COUNT(CASE WHEN status = 'open' AND is_active = true THEN 1 END)::text AS active_count,
          COALESCE(SUM(CASE WHEN status = 'open' AND is_active = true THEN value_cents ELSE 0 END), 0)::text AS active_value,
          COUNT(CASE WHEN status = 'won' AND updated_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)::text AS won_count,
          COALESCE(SUM(CASE WHEN status = 'won' AND updated_at >= DATE_TRUNC('month', CURRENT_DATE) THEN value_cents ELSE 0 END), 0)::text AS won_value
        FROM deals
      `)

      const contactRows: [{ count: string }] = await qr.query(`
        SELECT COUNT(*)::text AS count FROM contacts
        WHERE is_active = true AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `)

      const activityRows: [{ count: string }] = await qr.query(`
        SELECT COUNT(*)::text AS count FROM activities
        WHERE is_active = true AND status = 'pending'
      `)

      const inv = rows[0]!
      const deal = dealRows[0]
      return {
        totalReceivableCents: Number(inv.total_receivable_cents),
        totalOverdueCents: Number(inv.total_overdue_cents),
        activeDealsCount: Number(deal.active_count),
        activeDealsValueCents: Number(deal.active_value),
        invoicedThisMonthCents: Number(inv.invoiced_this_month_cents),
        invoicedThisMonthCount: Number(inv.invoiced_this_month_count),
        wonDealsThisMonthCount: Number(deal.won_count),
        wonDealsThisMonthValueCents: Number(deal.won_value),
        newContactsThisMonth: Number(contactRows[0].count),
        pendingActivitiesCount: Number(activityRows[0].count),
      }
    })

    await this.cache.set(cacheKey, metrics, CACHE_TTL)
    return metrics
  }

  async getPipelineSummary(schemaName: string): Promise<PipelineSummary[]> {
    return this.db.query(schemaName, async (qr): Promise<PipelineSummary[]> => {
      const rows: PipelineStageSummaryRow[] = await qr.query(`
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
      `)

      const grouped = new Map<string, PipelineSummary>()

      for (const r of rows) {
        let pipeline = grouped.get(r.pipeline_id)
        if (!pipeline) {
          pipeline = {
            pipelineId: r.pipeline_id,
            pipelineName: r.pipeline_name,
            stages: [],
            totalDeals: 0,
            totalValueCents: 0,
          }
          grouped.set(r.pipeline_id, pipeline)
        }

        const dealCount = Number(r.deal_count)
        const value = Number(r.total_value_cents)
        pipeline.stages.push({
          stageId: r.stage_id,
          stageName: r.stage_name,
          stageColor: r.stage_color,
          stagePosition: r.stage_position,
          dealCount,
          totalValueCents: value,
        })
        pipeline.totalDeals += dealCount
        pipeline.totalValueCents += value
      }

      return [...grouped.values()]
    })
  }

  async getTodayActivities(schemaName: string, userId: string): Promise<TodayActivity[]> {
    return this.db.query(schemaName, async (qr): Promise<TodayActivity[]> => {
      const rows: TodayActivityRow[] = await qr.query(
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

      return rows.map(
        (r): TodayActivity => ({
          id: r.id,
          activityType: r.activity_type,
          title: r.title,
          dueDate: r.due_date,
          status: r.status,
          contactName: r.contact_name,
          dealTitle: r.deal_title,
        }),
      )
    })
  }

  async getOverdueInvoices(schemaName: string, limit = 5): Promise<OverdueInvoice[]> {
    return this.db.query(schemaName, async (qr): Promise<OverdueInvoice[]> => {
      const rows: OverdueInvoiceRow[] = await qr.query(
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

      return rows.map(
        (r): OverdueInvoice => ({
          id: r.id,
          invoiceNumber: r.invoice_number,
          companyName: r.company_name,
          contactName: r.contact_name,
          totalCents: Number(r.total_cents),
          dueDate: r.due_date,
          daysOverdue: Number(r.days_overdue),
        }),
      )
    })
  }

  async getTopSalesReps(schemaName: string, limit = 5): Promise<TopSalesRep[]> {
    return this.db.query(schemaName, async (qr): Promise<TopSalesRep[]> => {
      const rows: TopSalesRepRow[] = await qr.query(
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

      return rows.map(
        (r): TopSalesRep => ({
          userId: r.user_id,
          userName: r.user_name,
          wonDealsCount: Number(r.won_deals_count),
          totalValueCents: Number(r.total_value_cents),
        }),
      )
    })
  }

  async getRevenueByMonth(schemaName: string, months = 6): Promise<RevenueByMonth[]> {
    return this.db.query(schemaName, async (qr): Promise<RevenueByMonth[]> => {
      const rows: RevenueByMonthRow[] = await qr.query(
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

      return rows.map(
        (r): RevenueByMonth => ({
          month: r.month,
          invoicedCents: Number(r.invoiced_cents),
          paidCents: Number(r.paid_cents),
          dealCount: Number(r.deal_count),
        }),
      )
    })
  }

  async invalidateCache(tenantId: string): Promise<void> {
    await this.cache.del(`dashboard:metrics:${tenantId}`)
  }
}
