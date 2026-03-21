export type DashboardMetrics = {
  totalReceivableCents: number
  totalOverdueCents: number
  activeDealsCount: number
  activeDealsValueCents: number
  invoicedThisMonthCents: number
  invoicedThisMonthCount: number
  wonDealsThisMonthCount: number
  wonDealsThisMonthValueCents: number
  newContactsThisMonth: number
  pendingActivitiesCount: number
}

export type PipelineStageSummary = {
  stageId: string
  stageName: string
  stageColor: string
  stagePosition: number
  dealCount: number
  totalValueCents: number
}

export type PipelineSummary = {
  pipelineId: string
  pipelineName: string
  stages: PipelineStageSummary[]
  totalDeals: number
  totalValueCents: number
}

export type TodayActivity = {
  id: string
  activityType: string
  title: string | null
  dueDate: string
  status: string
  contactName: string | null
  dealTitle: string | null
}

export type OverdueInvoice = {
  id: string
  invoiceNumber: string
  companyName: string | null
  contactName: string | null
  totalCents: number
  dueDate: string
  daysOverdue: number
}

export type TopSalesRep = {
  userId: string
  userName: string
  wonDealsCount: number
  totalValueCents: number
}

export type RevenueByMonth = {
  month: string
  invoicedCents: number
  paidCents: number
  dealCount: number
}

export type DashboardData = {
  metrics: DashboardMetrics
  pipelineSummary: PipelineSummary[]
  todayActivities: TodayActivity[]
  overdueInvoices: OverdueInvoice[]
  topSalesReps: TopSalesRep[]
  revenueByMonth: RevenueByMonth[]
}
