import type { DealStatus } from './enums'

// ─── Core Deal types ──────────────────────────────────────────────────────────

export type Deal = {
  id: string
  title: string
  valueCents: number
  expectedCloseDate: string | null
  stageId: string | null
  stageName: string | null
  pipelineId: string | null
  pipelineName: string | null
  contactId: string | null
  companyId: string | null
  assignedToId: string | null
  lossReason: string | null
  status: DealStatus
  customFields: Record<string, unknown>
  isActive: boolean
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export type DealListItem = Omit<Deal, 'customFields'>

export type PaginatedDeals = {
  data: DealListItem[]
  total: number
  page: number
  limit: number
}

// ─── Summary types used in related-entity responses ───────────────────────────

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

// ─── Deal items (products/services on a deal) ────────────────────────────────

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
  /** Calculated: quantity * unitPriceCents * (1 - discountPercent/100) */
  subtotalCents: number
  createdAt: string
}

// ─── Deal stage history ───────────────────────────────────────────────────────

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

// ─── Full detail (deal + joined relations) ────────────────────────────────────

export type DealDetail = Deal & {
  contact: DealContactSummary | null
  company: DealCompanySummary | null
  stage: DealStageSummary | null
  pipeline: DealPipelineSummary | null
  items: DealItem[]
}

// ─── Forecast ─────────────────────────────────────────────────────────────────

export type ForecastEntry = {
  month: string // "2026-04"
  totalValueCents: number
  weightedValueCents: number
  dealCount: number
}
