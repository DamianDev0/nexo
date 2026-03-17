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

// ─── Full detail (deal + joined relations) ────────────────────────────────────

export type DealDetail = Deal & {
  contact: DealContactSummary | null
  company: DealCompanySummary | null
  stage: DealStageSummary | null
  pipeline: DealPipelineSummary | null
}
