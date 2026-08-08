import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { DealStatus } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  DealDetailRow,
  DealItemRow,
  DealListPageRow,
  DealListRow,
  DealStageMoveRow,
  DealStatusRow,
  DealWithItemsRow,
  ForecastRow,
} from '../interfaces/deal-row.interfaces'
import type {
  CreateDealInput,
  DealListFilters,
  UpdateDealInput,
} from '../interfaces/deal-input.interfaces'
import {
  DEAL_DETAIL_COLUMNS,
  DEAL_DETAIL_FROM,
  DEAL_LIST_COLUMNS,
  DEAL_LIST_FROM,
  UPDATABLE_FIELDS,
} from '../constants/deal.constants'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class DealsRepository {
  constructor(private readonly db: TenantDbService) {}

  async findPage(
    schemaName: string,
    filters: DealListFilters,
    limit: number,
    offset: number,
  ): Promise<DealListPageRow> {
    return this.db.query(schemaName, async (qr): Promise<DealListPageRow> => {
      const { where, params } = this.buildWhereClause(filters)

      const countRows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count ${DEAL_LIST_FROM} WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const dataParams = [...params, limit, offset]
      const rows = await sqlRows<DealListRow[]>(
        qr,
        `SELECT ${DEAL_LIST_COLUMNS}
         ${DEAL_LIST_FROM}
         WHERE ${where}
         ORDER BY d.created_at DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { rows, total }
    })
  }

  async findDetail(schemaName: string, dealId: string): Promise<DealWithItemsRow> {
    return this.db.query(schemaName, (qr) => this.fetchDealOrFail(qr, dealId))
  }

  async create(
    schemaName: string,
    input: CreateDealInput,
    createdById: string,
  ): Promise<DealWithItemsRow> {
    return this.db.query(schemaName, async (qr): Promise<DealWithItemsRow> => {
      if (input.stageId && input.pipelineId) {
        await this.assertStageInPipeline(qr, input.stageId, input.pipelineId)
      }

      const insertRows = await sqlRows<[{ id: string }]>(
        qr,
        `INSERT INTO deals (
           title, value_cents, expected_close_date, stage_id, pipeline_id,
           contact_id, company_id, assigned_to_id, loss_reason,
           custom_fields, created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [
          input.title,
          input.valueCents ?? 0,
          input.expectedCloseDate ?? null,
          input.stageId ?? null,
          input.pipelineId ?? null,
          input.contactId ?? null,
          input.companyId ?? null,
          input.assignedToId ?? null,
          input.lossReason ?? null,
          input.customFields ?? {},
          createdById,
        ],
      )

      const dealId = insertRows[0].id

      if (input.stageId) {
        await this.recordStageChange(
          qr,
          dealId,
          null,
          input.stageId,
          null,
          DealStatus.OPEN,
          createdById,
        )
      }

      return this.fetchDealOrFail(qr, dealId)
    })
  }

  async update(
    schemaName: string,
    dealId: string,
    input: UpdateDealInput,
  ): Promise<DealWithItemsRow> {
    return this.db.query(schemaName, async (qr): Promise<DealWithItemsRow> => {
      await this.assertDealExists(qr, dealId)

      if (input.stageId && input.pipelineId) {
        await this.assertStageInPipeline(qr, input.stageId, input.pipelineId)
      }

      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      for (const [inputKey, col] of UPDATABLE_FIELDS) {
        if (input[inputKey] !== undefined) {
          params.push(input[inputKey])
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

      return this.fetchDealOrFail(qr, dealId)
    })
  }

  async softDelete(schemaName: string, dealId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      await this.assertDealExists(qr, dealId)
      await qr.query(`UPDATE deals SET is_active = false, updated_at = NOW() WHERE id = $1`, [
        dealId,
      ])
    })
  }

  async moveStage(
    schemaName: string,
    dealId: string,
    stageId: string,
    pipelineId: string,
    userId: string | null,
  ): Promise<DealStageMoveRow> {
    return this.db.query(schemaName, async (qr): Promise<DealStageMoveRow> => {
      const deal = await this.fetchDealRowOrFail(qr, dealId)
      await this.assertStageInPipeline(qr, stageId, pipelineId)

      await qr.query(
        `UPDATE deals
         SET stage_id = $1, pipeline_id = $2, updated_at = NOW()
         WHERE id = $3 AND is_active = true`,
        [stageId, pipelineId, dealId],
      )

      await this.recordStageChange(
        qr,
        dealId,
        deal.stage_id,
        stageId,
        deal.status,
        deal.status,
        userId,
      )

      const detail = await this.fetchDealOrFail(qr, dealId)
      return { ...detail, fromStageId: deal.stage_id }
    })
  }

  async markWon(
    schemaName: string,
    dealId: string,
    userId: string | null,
  ): Promise<DealWithItemsRow> {
    return this.db.query(schemaName, async (qr): Promise<DealWithItemsRow> => {
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
        userId,
      )

      return this.fetchDealOrFail(qr, dealId)
    })
  }

  async markLost(
    schemaName: string,
    dealId: string,
    lossReason: string,
    userId: string | null,
  ): Promise<DealWithItemsRow> {
    return this.db.query(schemaName, async (qr): Promise<DealWithItemsRow> => {
      const deal = await this.fetchDealRowOrFail(qr, dealId)
      this.assertDealIsOpen(deal.status)

      await qr.query(
        `UPDATE deals
         SET status = $1, loss_reason = $2, updated_at = NOW()
         WHERE id = $3 AND is_active = true`,
        [DealStatus.LOST, lossReason, dealId],
      )

      await this.recordStageChange(
        qr,
        dealId,
        deal.stage_id,
        deal.stage_id,
        deal.status,
        DealStatus.LOST,
        userId,
      )

      return this.fetchDealOrFail(qr, dealId)
    })
  }

  async reopen(
    schemaName: string,
    dealId: string,
    userId: string | null,
  ): Promise<DealWithItemsRow> {
    return this.db.query(schemaName, async (qr): Promise<DealWithItemsRow> => {
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
        userId,
      )

      return this.fetchDealOrFail(qr, dealId)
    })
  }

  async getForecast(schemaName: string, months: number): Promise<ForecastRow[]> {
    return this.db.query(schemaName, async (qr): Promise<ForecastRow[]> => {
      const rows = await sqlRows<ForecastRow[]>(
        qr,
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

      return rows
    })
  }

  private async fetchDealOrFail(qr: QueryRunner, dealId: string): Promise<DealWithItemsRow> {
    const rows = await sqlRows<DealDetailRow[]>(
      qr,
      `SELECT ${DEAL_DETAIL_COLUMNS} ${DEAL_DETAIL_FROM} WHERE d.id = $1 AND d.is_active = true`,
      [dealId],
    )

    const row = rows[0]
    if (!row) throw new NotFoundException(`Deal ${dealId} not found`)

    const itemRows = await sqlRows<DealItemRow[]>(
      qr,
      `SELECT * FROM deal_items WHERE deal_id = $1 ORDER BY position ASC`,
      [dealId],
    )

    return { deal: row, items: itemRows }
  }

  private async fetchDealRowOrFail(qr: QueryRunner, dealId: string): Promise<DealStatusRow> {
    const rows = await sqlRows<[DealStatusRow?]>(
      qr,
      `SELECT id, stage_id, status FROM deals WHERE id = $1 AND is_active = true`,
      [dealId],
    )

    const row = rows[0]
    if (!row) throw new NotFoundException(`Deal ${dealId} not found`)
    return row
  }

  private async assertDealExists(qr: QueryRunner, dealId: string): Promise<void> {
    const rows = await sqlRows<[{ id: string }?]>(
      qr,
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
    const rows = await sqlRows<[{ id: string }?]>(
      qr,
      `SELECT id FROM pipeline_stages WHERE id = $1 AND pipeline_id = $2`,
      [stageId, pipelineId],
    )

    if (rows.length === 0) {
      throw new BadRequestException(`Stage ${stageId} does not belong to pipeline ${pipelineId}`)
    }
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

  private buildWhereClause(filters: DealListFilters): { where: string; params: unknown[] } {
    const conditions: string[] = ['d.is_active = true']
    const params: unknown[] = []

    if (filters.q) {
      params.push(filters.q)
      conditions.push(`d.title ILIKE '%' || $${params.length} || '%'`)
    }

    if (filters.status) {
      params.push(filters.status)
      conditions.push(`d.status = $${params.length}`)
    }

    if (filters.pipelineId) {
      params.push(filters.pipelineId)
      conditions.push(`d.pipeline_id = $${params.length}`)
    }

    if (filters.stageId) {
      params.push(filters.stageId)
      conditions.push(`d.stage_id = $${params.length}`)
    }

    if (filters.contactId) {
      params.push(filters.contactId)
      conditions.push(`d.contact_id = $${params.length}`)
    }

    if (filters.companyId) {
      params.push(filters.companyId)
      conditions.push(`d.company_id = $${params.length}`)
    }

    if (filters.assignedToId) {
      params.push(filters.assignedToId)
      conditions.push(`d.assigned_to_id = $${params.length}`)
    }

    return { where: conditions.join(' AND '), params }
  }
}
