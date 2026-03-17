import type { UpdateDealDto } from '../dto/deal.dto'

// ─── Field mapping: DTO key → SQL column ─────────────────────────────────────

export const UPDATABLE_FIELDS: Array<[keyof UpdateDealDto, string]> = [
  ['title', 'title'],
  ['valueCents', 'value_cents'],
  ['expectedCloseDate', 'expected_close_date'],
  ['stageId', 'stage_id'],
  ['pipelineId', 'pipeline_id'],
  ['contactId', 'contact_id'],
  ['companyId', 'company_id'],
  ['assignedToId', 'assigned_to_id'],
  ['lossReason', 'loss_reason'],
  ['customFields', 'custom_fields'],
]

// ─── SQL column lists ─────────────────────────────────────────────────────────

/** Columns for list view — no custom_fields, no contact/company detail */
export const DEAL_LIST_COLUMNS = `
  d.id, d.title, d.value_cents, d.expected_close_date,
  d.stage_id,
  ps.name  AS stage_name,
  ps.color AS stage_color,
  ps.probability AS stage_probability,
  ps.position    AS stage_position,
  d.pipeline_id,
  p.name AS pipeline_name,
  d.contact_id, d.company_id, d.assigned_to_id,
  d.loss_reason, d.status, d.is_active,
  d.created_by, d.created_at, d.updated_at
`

/** Columns for detail view — includes custom_fields + joined contact/company */
export const DEAL_DETAIL_COLUMNS = `
  d.id, d.title, d.value_cents, d.expected_close_date,
  d.stage_id,
  ps.name  AS stage_name,
  ps.color AS stage_color,
  ps.probability AS stage_probability,
  ps.position    AS stage_position,
  d.pipeline_id,
  p.name AS pipeline_name,
  d.contact_id,
  c.first_name AS contact_first_name,
  c.last_name  AS contact_last_name,
  c.email      AS contact_email,
  c.phone      AS contact_phone,
  d.company_id,
  co.name AS company_name,
  co.nit  AS company_nit,
  d.assigned_to_id, d.loss_reason, d.status,
  d.custom_fields, d.is_active, d.created_by, d.created_at, d.updated_at
`

// ─── FROM clauses with JOINs ─────────────────────────────────────────────────

export const DEAL_LIST_FROM = `
  FROM deals d
  LEFT JOIN pipeline_stages ps ON ps.id = d.stage_id
  LEFT JOIN pipelines        p  ON p.id  = d.pipeline_id
`

export const DEAL_DETAIL_FROM = `
  FROM deals d
  LEFT JOIN pipeline_stages ps ON ps.id  = d.stage_id
  LEFT JOIN pipelines        p  ON p.id   = d.pipeline_id
  LEFT JOIN contacts         c  ON c.id   = d.contact_id
  LEFT JOIN companies        co ON co.id  = d.company_id
`
