import type {
  DealDetail,
  DealItem,
  DealListItem,
  DealStatus,
  ForecastEntry,
} from '@repo/shared-types'
import { CURRENCY_CODE } from '@repo/shared-utils'
import { toCents } from '@/shared/utils/money'
import type {
  DealDetailRow,
  DealItemRow,
  DealListRow,
  ForecastRow,
} from '../interfaces/deal-row.interfaces'

export function mapDealListItem(r: DealListRow): DealListItem {
  return {
    id: r.id,
    title: r.title,
    valueCents: toCents(r.value_cents),
    expectedCloseDate: r.expected_close_date,
    closeDateActual: r.close_date_actual ?? null,
    stageId: r.stage_id,
    stageName: r.stage_name,
    pipelineId: r.pipeline_id,
    pipelineName: r.pipeline_name,
    contactId: r.contact_id,
    companyId: r.company_id,
    assignedToId: r.assigned_to_id,
    lossReason: r.loss_reason,
    status: r.status as DealStatus,
    nextStep: r.next_step ?? null,
    dealType: (r.deal_type ?? 'new_business') as DealListItem['dealType'],
    priority: (r.priority ?? 'medium') as DealListItem['priority'],
    probabilityOverride: r.probability_override ?? null,
    competitors: r.competitors ?? [],
    currency: r.currency ?? CURRENCY_CODE,
    leadSource: r.lead_source ?? null,
    isActive: r.is_active,
    createdById: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export function mapDealDetail(r: DealDetailRow): Omit<DealDetail, 'items'> {
  return {
    ...mapDealListItem(r),
    description: r.description ?? null,
    customFields: r.custom_fields ?? {},
    contact: r.contact_id
      ? {
          id: r.contact_id,
          firstName: r.contact_first_name ?? '',
          lastName: r.contact_last_name,
          email: r.contact_email,
          phone: r.contact_phone,
        }
      : null,
    company: r.company_id
      ? {
          id: r.company_id,
          name: r.company_name ?? '',
          nit: r.company_nit,
        }
      : null,
    stage: r.stage_id
      ? {
          id: r.stage_id,
          name: r.stage_name ?? '',
          color: r.stage_color ?? '#3B82F6',
          probability: r.stage_probability ?? 0,
          position: r.stage_position ?? 0,
        }
      : null,
    pipeline: r.pipeline_id
      ? {
          id: r.pipeline_id,
          name: r.pipeline_name ?? '',
        }
      : null,
  }
}

export function mapDealItem(r: DealItemRow): DealItem {
  const unitPrice = toCents(r.unit_price_cents)
  const subtotal = Math.round((r.quantity * unitPrice * (100 - r.discount_percent)) / 100)
  return {
    id: r.id,
    dealId: r.deal_id,
    productId: r.product_id,
    description: r.description,
    quantity: r.quantity,
    unitPriceCents: unitPrice,
    discountPercent: r.discount_percent,
    ivaRate: r.iva_rate,
    position: r.position,
    subtotalCents: subtotal,
    createdAt: r.created_at,
  }
}

export function mapForecastEntry(r: ForecastRow): ForecastEntry {
  return {
    month: r.month,
    totalValueCents: toCents(r.total_value_cents),
    weightedValueCents: toCents(r.weighted_value_cents),
    dealCount: Number(r.deal_count),
  }
}
