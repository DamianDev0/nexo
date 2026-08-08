import type {
  DashboardMetrics,
  OverdueInvoice,
  PipelineSummary,
  RevenueByMonth,
  TodayActivity,
  TopSalesRep,
} from '@repo/shared-types'
import type {
  MetricsQueryResult,
  OverdueInvoiceRow,
  PipelineStageSummaryRow,
  RevenueByMonthRow,
  TodayActivityRow,
  TopSalesRepRow,
} from '../interfaces/dashboard-row.interfaces'

export function buildMetrics(result: MetricsQueryResult): DashboardMetrics {
  const inv = result.invoices
  const deal = result.deals
  return {
    totalReceivableCents: Number(inv.total_receivable_cents),
    totalOverdueCents: Number(inv.total_overdue_cents),
    activeDealsCount: Number(deal.active_count),
    activeDealsValueCents: Number(deal.active_value),
    invoicedThisMonthCents: Number(inv.invoiced_this_month_cents),
    invoicedThisMonthCount: Number(inv.invoiced_this_month_count),
    wonDealsThisMonthCount: Number(deal.won_count),
    wonDealsThisMonthValueCents: Number(deal.won_value),
    newContactsThisMonth: Number(result.newContacts.count),
    pendingActivitiesCount: Number(result.pendingActivities.count),
  }
}

export function groupPipelineSummary(rows: PipelineStageSummaryRow[]): PipelineSummary[] {
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
}

export function mapTodayActivity(r: TodayActivityRow): TodayActivity {
  return {
    id: r.id,
    activityType: r.activity_type,
    title: r.title,
    dueDate: r.due_date,
    status: r.status,
    contactName: r.contact_name,
    dealTitle: r.deal_title,
  }
}

export function mapOverdueInvoice(r: OverdueInvoiceRow): OverdueInvoice {
  return {
    id: r.id,
    invoiceNumber: r.invoice_number,
    companyName: r.company_name,
    contactName: r.contact_name,
    totalCents: Number(r.total_cents),
    dueDate: r.due_date,
    daysOverdue: Number(r.days_overdue),
  }
}

export function mapTopSalesRep(r: TopSalesRepRow): TopSalesRep {
  return {
    userId: r.user_id,
    userName: r.user_name,
    wonDealsCount: Number(r.won_deals_count),
    totalValueCents: Number(r.total_value_cents),
  }
}

export function mapRevenueByMonth(r: RevenueByMonthRow): RevenueByMonth {
  return {
    month: r.month,
    invoicedCents: Number(r.invoiced_cents),
    paidCents: Number(r.paid_cents),
    dealCount: Number(r.deal_count),
  }
}
