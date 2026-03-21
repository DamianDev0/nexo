import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { DealStatus } from '@repo/shared-types'
import { AuditLogService } from '@/shared/audit-log/audit-log.service'
import { AuditAction, AuditEntityType } from '@/shared/audit-log/audit-log.interfaces'
import type {
  DealDetail,
  DealItem,
  DealListItem,
  ForecastEntry,
  PaginatedDeals,
} from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  CreateDealDto,
  CreateDealItemDto,
  DealQueryDto,
  LoseDealDto,
  MoveDealDto,
  UpdateDealDto,
  UpdateDealItemDto,
} from './dto/deal.dto'
import type {
  DealDetailRow,
  DealItemRow,
  DealListRow,
  ForecastRow,
} from './interfaces/deal-row.interfaces'
import {
  DEAL_DETAIL_COLUMNS,
  DEAL_DETAIL_FROM,
  DEAL_LIST_COLUMNS,
  DEAL_LIST_FROM,
  UPDATABLE_FIELDS,
} from './constants/deal.constants'

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class DealsService {
  constructor(
    private readonly db: TenantDbService,
    private readonly audit: AuditLogService,
  ) {}

  // ─── List ─────────────────────────────────────────────────────────────────

  async findAll(schemaName: string, query: DealQueryDto): Promise<PaginatedDeals> {
    return this.db.query(schemaName, async (qr): Promise<PaginatedDeals> => {
      const page = query.page ?? 1
      const limit = query.limit ?? 25
      const offset = (page - 1) * limit

      const { where, params } = this.buildWhereClause(query)

      const countRows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count ${DEAL_LIST_FROM} WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const dataParams = [...params, limit, offset]
      const rows: DealListRow[] = await qr.query(
        `SELECT ${DEAL_LIST_COLUMNS}
         ${DEAL_LIST_FROM}
         WHERE ${where}
         ORDER BY d.created_at DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { data: rows.map((r) => this.mapListItem(r)), total, page, limit }
    })
  }

  // ─── Find one ─────────────────────────────────────────────────────────────

  async findOne(schemaName: string, dealId: string): Promise<DealDetail> {
    return this.db.query(schemaName, (qr) => this.fetchDealOrFail(qr, dealId))
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(schemaName: string, dto: CreateDealDto, createdById: string): Promise<DealDetail> {
    return this.db.query(schemaName, async (qr): Promise<DealDetail> => {
      if (dto.stageId && dto.pipelineId) {
        await this.assertStageInPipeline(qr, dto.stageId, dto.pipelineId)
      }

      const insertRows: [{ id: string }] = await qr.query(
        `INSERT INTO deals (
           title, value_cents, expected_close_date, stage_id, pipeline_id,
           contact_id, company_id, assigned_to_id, loss_reason,
           custom_fields, created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [
          dto.title,
          dto.valueCents ?? 0,
          dto.expectedCloseDate ?? null,
          dto.stageId ?? null,
          dto.pipelineId ?? null,
          dto.contactId ?? null,
          dto.companyId ?? null,
          dto.assignedToId ?? null,
          dto.lossReason ?? null,
          dto.customFields ?? {},
          createdById,
        ],
      )

      const dealId = insertRows[0].id

      // Record initial stage assignment in history
      if (dto.stageId) {
        await this.recordStageChange(
          qr,
          dealId,
          null,
          dto.stageId,
          null,
          DealStatus.OPEN,
          createdById,
        )
      }

      const result = await this.fetchDealOrFail(qr, dealId)
      void this.audit.entityEvent(
        schemaName,
        AuditAction.DealCreated,
        AuditEntityType.Deal,
        result.id,
        createdById,
        `Deal "${dto.title}" created`,
      )
      return result
    })
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(schemaName: string, dealId: string, dto: UpdateDealDto): Promise<DealDetail> {
    return this.db.query(schemaName, async (qr): Promise<DealDetail> => {
      await this.assertDealExists(qr, dealId)

      if (dto.stageId && dto.pipelineId) {
        await this.assertStageInPipeline(qr, dto.stageId, dto.pipelineId)
      }

      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      for (const [dtoKey, col] of UPDATABLE_FIELDS) {
        if (dto[dtoKey] !== undefined) {
          params.push(dto[dtoKey])
          sets.push(`${col} = $${params.length}`)
        }
      }

      if (sets.length === 1) {
        return this.fetchDealOrFail(qr, dealId)
      }

      params.push(dealId)
      await qr.query(
        `UPDATE deals
         SET ${sets.join(', ')}
         WHERE id = $${params.length} AND is_active = true`,
        params,
      )

      const result = await this.fetchDealOrFail(qr, dealId)
      void this.audit.entityEvent(
        schemaName,
        AuditAction.DealUpdated,
        AuditEntityType.Deal,
        dealId,
        undefined,
        `Deal ${dealId} updated`,
      )
      return result
    })
  }

  // ─── Delete (soft) ────────────────────────────────────────────────────────

  async remove(schemaName: string, dealId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      await this.assertDealExists(qr, dealId)
      await qr.query(`UPDATE deals SET is_active = false, updated_at = NOW() WHERE id = $1`, [
        dealId,
      ])
      void this.audit.entityEvent(
        schemaName,
        AuditAction.DealDeleted,
        AuditEntityType.Deal,
        dealId,
        undefined,
        `Deal ${dealId} deleted`,
      )
    })
  }

  // ─── Move to stage ────────────────────────────────────────────────────────

  async moveStage(
    schemaName: string,
    dealId: string,
    dto: MoveDealDto,
    userId?: string,
  ): Promise<DealDetail> {
    return this.db.query(schemaName, async (qr): Promise<DealDetail> => {
      const deal = await this.fetchDealRowOrFail(qr, dealId)
      await this.assertStageInPipeline(qr, dto.stageId, dto.pipelineId)

      await qr.query(
        `UPDATE deals
         SET stage_id = $1, pipeline_id = $2, updated_at = NOW()
         WHERE id = $3 AND is_active = true`,
        [dto.stageId, dto.pipelineId, dealId],
      )

      await this.recordStageChange(
        qr,
        dealId,
        deal.stage_id,
        dto.stageId,
        deal.status,
        deal.status,
        userId ?? null,
      )

      const result = await this.fetchDealOrFail(qr, dealId)
      void this.audit.entityEvent(
        schemaName,
        AuditAction.DealStageChanged,
        AuditEntityType.Deal,
        dealId,
        userId,
        `Deal ${dealId} moved to stage ${dto.stageId}`,
        { oldValue: { stageId: deal.stage_id }, newValue: { stageId: dto.stageId } },
      )
      return result
    })
  }

  // ─── Mark won ─────────────────────────────────────────────────────────────

  async markWon(schemaName: string, dealId: string, userId?: string): Promise<DealDetail> {
    return this.db.query(schemaName, async (qr): Promise<DealDetail> => {
      const deal = await this.fetchDealRowOrFail(qr, dealId)
      this.assertDealIsOpen(deal.status)

      await qr.query(
        `UPDATE deals
         SET status = $1, loss_reason = NULL, updated_at = NOW()
         WHERE id = $2 AND is_active = true`,
        [DealStatus.WON, dealId],
      )

      await this.recordStageChange(
        qr,
        dealId,
        deal.stage_id,
        deal.stage_id,
        deal.status,
        DealStatus.WON,
        userId ?? null,
      )

      const result = await this.fetchDealOrFail(qr, dealId)
      void this.audit.entityEvent(
        schemaName,
        AuditAction.DealWon,
        AuditEntityType.Deal,
        dealId,
        userId,
        `Deal ${dealId} marked as won`,
      )
      return result
    })
  }

  // ─── Mark lost ────────────────────────────────────────────────────────────

  async markLost(
    schemaName: string,
    dealId: string,
    dto: LoseDealDto,
    userId?: string,
  ): Promise<DealDetail> {
    return this.db.query(schemaName, async (qr): Promise<DealDetail> => {
      const deal = await this.fetchDealRowOrFail(qr, dealId)
      this.assertDealIsOpen(deal.status)

      await qr.query(
        `UPDATE deals
         SET status = $1, loss_reason = $2, updated_at = NOW()
         WHERE id = $3 AND is_active = true`,
        [DealStatus.LOST, dto.lossReason, dealId],
      )

      await this.recordStageChange(
        qr,
        dealId,
        deal.stage_id,
        deal.stage_id,
        deal.status,
        DealStatus.LOST,
        userId ?? null,
      )

      const result = await this.fetchDealOrFail(qr, dealId)
      void this.audit.entityEvent(
        schemaName,
        AuditAction.DealLost,
        AuditEntityType.Deal,
        dealId,
        userId,
        `Deal ${dealId} marked as lost`,
        { newValue: { lossReason: dto.lossReason } },
      )
      return result
    })
  }

  // ─── Reopen ───────────────────────────────────────────────────────────────

  async reopen(schemaName: string, dealId: string, userId?: string): Promise<DealDetail> {
    return this.db.query(schemaName, async (qr): Promise<DealDetail> => {
      const deal = await this.fetchDealRowOrFail(qr, dealId)
      if (deal.status === DealStatus.OPEN) {
        throw new BadRequestException('Deal is already open')
      }

      await qr.query(
        `UPDATE deals
         SET status = $1, loss_reason = NULL, updated_at = NOW()
         WHERE id = $2 AND is_active = true`,
        [DealStatus.OPEN, dealId],
      )

      await this.recordStageChange(
        qr,
        dealId,
        deal.stage_id,
        deal.stage_id,
        deal.status,
        DealStatus.OPEN,
        userId ?? null,
      )

      return this.fetchDealOrFail(qr, dealId)
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  Deal Items
  // ═══════════════════════════════════════════════════════════════════════════

  async addItem(schemaName: string, dealId: string, dto: CreateDealItemDto): Promise<DealItem> {
    return this.db.transactional(schemaName, async (qr): Promise<DealItem> => {
      await this.assertDealExists(qr, dealId)

      const position = await this.getNextItemPosition(qr, dealId)

      const rows: DealItemRow[] = await qr.query(
        `INSERT INTO deal_items (deal_id, product_id, description, quantity, unit_price_cents, discount_percent, iva_rate, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          dealId,
          dto.productId ?? null,
          dto.description,
          dto.quantity ?? 1,
          dto.unitPriceCents,
          dto.discountPercent ?? 0,
          dto.ivaRate ?? 19,
          position,
        ],
      )

      const row = rows[0]
      if (!row) throw new BadRequestException('Failed to create deal item')

      await this.recalcDealValue(qr, dealId)
      return this.mapItem(row)
    })
  }

  async updateItem(
    schemaName: string,
    dealId: string,
    itemId: string,
    dto: UpdateDealItemDto,
  ): Promise<DealItem> {
    return this.db.transactional(schemaName, async (qr): Promise<DealItem> => {
      await this.assertItemExists(qr, itemId, dealId)

      const sets: string[] = []
      const params: unknown[] = []

      if (dto.description !== undefined) {
        params.push(dto.description)
        sets.push(`description = $${params.length}`)
      }
      if (dto.productId !== undefined) {
        params.push(dto.productId)
        sets.push(`product_id = $${params.length}`)
      }
      if (dto.quantity !== undefined) {
        params.push(dto.quantity)
        sets.push(`quantity = $${params.length}`)
      }
      if (dto.unitPriceCents !== undefined) {
        params.push(dto.unitPriceCents)
        sets.push(`unit_price_cents = $${params.length}`)
      }
      if (dto.discountPercent !== undefined) {
        params.push(dto.discountPercent)
        sets.push(`discount_percent = $${params.length}`)
      }
      if (dto.ivaRate !== undefined) {
        params.push(dto.ivaRate)
        sets.push(`iva_rate = $${params.length}`)
      }

      if (sets.length === 0) {
        return this.fetchItemOrFail(qr, itemId)
      }

      params.push(itemId)
      await qr.query(
        `UPDATE deal_items SET ${sets.join(', ')} WHERE id = $${params.length}`,
        params,
      )

      await this.recalcDealValue(qr, dealId)
      return this.fetchItemOrFail(qr, itemId)
    })
  }

  async removeItem(schemaName: string, dealId: string, itemId: string): Promise<void> {
    return this.db.transactional(schemaName, async (qr): Promise<void> => {
      await this.assertItemExists(qr, itemId, dealId)
      await qr.query(`DELETE FROM deal_items WHERE id = $1 AND deal_id = $2`, [itemId, dealId])
      await this.recalcDealValue(qr, dealId)
    })
  }

  async getItems(schemaName: string, dealId: string): Promise<DealItem[]> {
    return this.db.query(schemaName, async (qr): Promise<DealItem[]> => {
      await this.assertDealExists(qr, dealId)
      const rows: DealItemRow[] = await qr.query(
        `SELECT * FROM deal_items WHERE deal_id = $1 ORDER BY position ASC`,
        [dealId],
      )
      return rows.map((r) => this.mapItem(r))
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  Forecast
  // ═══════════════════════════════════════════════════════════════════════════

  async getForecast(schemaName: string, months = 6): Promise<ForecastEntry[]> {
    return this.db.query(schemaName, async (qr): Promise<ForecastEntry[]> => {
      const rows: ForecastRow[] = await qr.query(
        `SELECT
           TO_CHAR(d.expected_close_date, 'YYYY-MM') AS month,
           SUM(d.value_cents)::text                  AS total_value_cents,
           SUM(d.value_cents * COALESCE(ps.probability, 0) / 100)::text AS weighted_value_cents,
           COUNT(*)::text                            AS deal_count
         FROM deals d
         LEFT JOIN pipeline_stages ps ON ps.id = d.stage_id
         WHERE d.is_active = true
           AND d.status = 'open'
           AND d.expected_close_date IS NOT NULL
           AND d.expected_close_date >= DATE_TRUNC('month', CURRENT_DATE)
           AND d.expected_close_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' * $1
         GROUP BY TO_CHAR(d.expected_close_date, 'YYYY-MM')
         ORDER BY month ASC`,
        [months],
      )

      return rows.map(
        (r): ForecastEntry => ({
          month: r.month,
          totalValueCents: Number(r.total_value_cents),
          weightedValueCents: Number(r.weighted_value_cents),
          dealCount: Number(r.deal_count),
        }),
      )
    })
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async fetchDealOrFail(qr: QueryRunner, dealId: string): Promise<DealDetail> {
    const rows: DealDetailRow[] = await qr.query(
      `SELECT ${DEAL_DETAIL_COLUMNS} ${DEAL_DETAIL_FROM} WHERE d.id = $1 AND d.is_active = true`,
      [dealId],
    )

    const row = rows[0]
    if (!row) throw new NotFoundException(`Deal ${dealId} not found`)

    const itemRows: DealItemRow[] = await qr.query(
      `SELECT * FROM deal_items WHERE deal_id = $1 ORDER BY position ASC`,
      [dealId],
    )

    return { ...this.mapDetail(row), items: itemRows.map((r) => this.mapItem(r)) }
  }

  private async fetchDealRowOrFail(
    qr: QueryRunner,
    dealId: string,
  ): Promise<{ id: string; stage_id: string | null; status: string }> {
    const rows: [{ id: string; stage_id: string | null; status: string }?] = await qr.query(
      `SELECT id, stage_id, status FROM deals WHERE id = $1 AND is_active = true`,
      [dealId],
    )

    const row = rows[0]
    if (!row) throw new NotFoundException(`Deal ${dealId} not found`)
    return row
  }

  private async assertDealExists(qr: QueryRunner, dealId: string): Promise<void> {
    const rows: [{ id: string }?] = await qr.query(
      `SELECT id FROM deals WHERE id = $1 AND is_active = true`,
      [dealId],
    )

    if (rows.length === 0) {
      throw new NotFoundException(`Deal ${dealId} not found`)
    }
  }

  private assertDealIsOpen(status: string): void {
    if (status !== DealStatus.OPEN) {
      throw new BadRequestException(`Deal must be open to change status. Current status: ${status}`)
    }
  }

  private async assertStageInPipeline(
    qr: QueryRunner,
    stageId: string,
    pipelineId: string,
  ): Promise<void> {
    const rows: [{ id: string }?] = await qr.query(
      `SELECT id FROM pipeline_stages WHERE id = $1 AND pipeline_id = $2`,
      [stageId, pipelineId],
    )

    if (rows.length === 0) {
      throw new BadRequestException(`Stage ${stageId} does not belong to pipeline ${pipelineId}`)
    }
  }

  private async assertItemExists(qr: QueryRunner, itemId: string, dealId: string): Promise<void> {
    const rows: [{ id: string }?] = await qr.query(
      `SELECT id FROM deal_items WHERE id = $1 AND deal_id = $2`,
      [itemId, dealId],
    )

    if (rows.length === 0) {
      throw new NotFoundException(`Item ${itemId} not found in deal ${dealId}`)
    }
  }

  private async fetchItemOrFail(qr: QueryRunner, itemId: string): Promise<DealItem> {
    const rows: DealItemRow[] = await qr.query(`SELECT * FROM deal_items WHERE id = $1`, [itemId])

    const row = rows[0]
    if (!row) throw new NotFoundException(`Item ${itemId} not found`)
    return this.mapItem(row)
  }

  private async getNextItemPosition(qr: QueryRunner, dealId: string): Promise<number> {
    const rows: [{ max_pos: number | null }] = await qr.query(
      `SELECT MAX(position) AS max_pos FROM deal_items WHERE deal_id = $1`,
      [dealId],
    )
    return (rows[0].max_pos ?? -1) + 1
  }

  /** Recalculate deal.value_cents from the sum of its items subtotals */
  private async recalcDealValue(qr: QueryRunner, dealId: string): Promise<void> {
    await qr.query(
      `UPDATE deals SET
         value_cents = COALESCE((
           SELECT SUM(quantity * unit_price_cents * (100 - discount_percent) / 100)
           FROM deal_items WHERE deal_id = $1
         ), 0),
         updated_at = NOW()
       WHERE id = $1`,
      [dealId],
    )
  }

  private async recordStageChange(
    qr: QueryRunner,
    dealId: string,
    fromStageId: string | null,
    toStageId: string | null,
    fromStatus: string | null,
    toStatus: string,
    changedBy: string | null,
  ): Promise<void> {
    await qr.query(
      `INSERT INTO deal_stage_history (deal_id, from_stage_id, to_stage_id, from_status, to_status, changed_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [dealId, fromStageId, toStageId, fromStatus, toStatus, changedBy],
    )
  }

  private buildWhereClause(query: DealQueryDto): { where: string; params: unknown[] } {
    const conditions: string[] = ['d.is_active = true']
    const params: unknown[] = []

    if (query.q) {
      params.push(query.q)
      conditions.push(`d.title ILIKE '%' || $${params.length} || '%'`)
    }

    if (query.status) {
      params.push(query.status)
      conditions.push(`d.status = $${params.length}`)
    }

    if (query.pipelineId) {
      params.push(query.pipelineId)
      conditions.push(`d.pipeline_id = $${params.length}`)
    }

    if (query.stageId) {
      params.push(query.stageId)
      conditions.push(`d.stage_id = $${params.length}`)
    }

    if (query.contactId) {
      params.push(query.contactId)
      conditions.push(`d.contact_id = $${params.length}`)
    }

    if (query.companyId) {
      params.push(query.companyId)
      conditions.push(`d.company_id = $${params.length}`)
    }

    if (query.assignedToId) {
      params.push(query.assignedToId)
      conditions.push(`d.assigned_to_id = $${params.length}`)
    }

    return { where: conditions.join(' AND '), params }
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  private mapListItem(r: DealListRow): DealListItem {
    return {
      id: r.id,
      title: r.title,
      valueCents: Number(r.value_cents),
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
      currency: r.currency ?? 'COP',
      leadSource: r.lead_source ?? null,
      isActive: r.is_active,
      createdById: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }

  private mapDetail(r: DealDetailRow): Omit<DealDetail, 'items'> {
    return {
      ...this.mapListItem(r),
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

  private mapItem(r: DealItemRow): DealItem {
    const unitPrice = Number(r.unit_price_cents)
    const subtotal = (r.quantity * unitPrice * (100 - r.discount_percent)) / 100
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
      subtotalCents: Math.round(subtotal),
      createdAt: r.created_at,
    }
  }
}
