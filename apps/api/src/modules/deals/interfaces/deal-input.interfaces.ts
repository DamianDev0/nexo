export type DealListFilters = {
  q?: string
  status?: string
  pipelineId?: string
  stageId?: string
  contactId?: string
  companyId?: string
  assignedToId?: string
}

export type CreateDealInput = {
  title: string
  valueCents?: number
  expectedCloseDate?: string
  stageId?: string
  pipelineId?: string
  contactId?: string
  companyId?: string
  assignedToId?: string
  lossReason?: string
  customFields?: Record<string, unknown>
}

export type UpdateDealInput = Partial<CreateDealInput>

export type CreateDealItemInput = {
  productId?: string
  description: string
  quantity?: number
  unitPriceCents: number
  discountPercent?: number
  ivaRate?: number
}

export type UpdateDealItemInput = Partial<CreateDealItemInput>
