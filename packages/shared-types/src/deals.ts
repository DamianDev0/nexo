import type { DealPriority, DealStatus, DealType } from './enums'

export type Deal = {
  id: string
  title: string
  valueCents: number
  expectedCloseDate: string | null
  closeDateActual: string | null
  stageId: string | null
  stageName: string | null
  pipelineId: string | null
  pipelineName: string | null
  contactId: string | null
  companyId: string | null
  assignedToId: string | null
  lossReason: string | null
  status: DealStatus
  description: string | null
  nextStep: string | null
  dealType: DealType
  priority: DealPriority
  probabilityOverride: number | null
  competitors: string[]
  currency: string
  leadSource: string | null
  customFields: Record<string, unknown>
  isActive: boolean
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export type DealListItem = Omit<Deal, 'customFields' | 'description'>

export type PaginatedDeals = {
  data: DealListItem[]
  total: number
  page: number
  limit: number
}

export type DealContactSummary = {
  id: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
}

export type DealCompanySummary = {
  id: string
  name: string
  nit: string | null
}

export type DealStageSummary = {
  id: string
  name: string
  color: string
  probability: number
  position: number
}

export type DealPipelineSummary = {
  id: string
  name: string
}

export type DealItem = {
  id: string
  dealId: string
  productId: string | null
  description: string
  quantity: number
  unitPriceCents: number
  discountPercent: number
  ivaRate: number
  position: number
  subtotalCents: number
  createdAt: string
}

export type DealStageHistoryEntry = {
  id: string
  dealId: string
  fromStageId: string | null
  toStageId: string | null
  fromStatus: string | null
  toStatus: string | null
  changedBy: string | null
  changedAt: string
}

export type DealDetail = Deal & {
  contact: DealContactSummary | null
  company: DealCompanySummary | null
  stage: DealStageSummary | null
  pipeline: DealPipelineSummary | null
  items: DealItem[]
}

export type ForecastEntry = {
  month: string
  totalValueCents: number
  weightedValueCents: number
  dealCount: number
}
