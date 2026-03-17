import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { DealStatus } from '@repo/shared-types'
import type { DealDetail, DealListItem, PaginatedDeals } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  CreateDealDto,
  DealQueryDto,
  LoseDealDto,
  MoveDealDto,
  UpdateDealDto,
} from './dto/deal.dto'
import type { DealDetailRow, DealListRow } from './interfaces/deal-row.interfaces'
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
  constructor(private readonly db: TenantDbService) {}

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

      return this.fetchDealOrFail(qr, insertRows[0].id)
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
        // nothing to update beyond updated_at — return current state
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

  // ─── Delete (soft) ────────────────────────────────────────────────────────

  async remove(schemaName: string, dealId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      await this.assertDealExists(qr, dealId)
      await qr.query(`UPDATE deals SET is_active = false, updated_at = NOW() WHERE id = $1`, [
        dealId,
      ])
    })
  }

  // ─── Move to stage ────────────────────────────────────────────────────────

  async moveStage(schemaName: string, dealId: string, dto: MoveDealDto): Promise<DealDetail> {
    return this.db.query(schemaName, async (qr): Promise<DealDetail> => {
      await this.assertDealExists(qr, dealId)
      await this.assertStageInPipeline(qr, dto.stageId, dto.pipelineId)

      await qr.query(
        `UPDATE deals
         SET stage_id = $1, pipeline_id = $2, updated_at = NOW()
         WHERE id = $3 AND is_active = true`,
        [dto.stageId, dto.pipelineId, dealId],
      )

      return this.fetchDealOrFail(qr, dealId)
    })
  }

  // ─── Mark won ─────────────────────────────────────────────────────────────

  async markWon(schemaName: string, dealId: string): Promise<DealDetail> {
    return this.db.query(schemaName, async (qr): Promise<DealDetail> => {
      await this.assertDealExists(qr, dealId)

      await qr.query(
        `UPDATE deals
         SET status = $1, loss_reason = NULL, updated_at = NOW()
         WHERE id = $2 AND is_active = true`,
        [DealStatus.WON, dealId],
      )

      return this.fetchDealOrFail(qr, dealId)
    })
  }

  // ─── Mark lost ────────────────────────────────────────────────────────────

  async markLost(schemaName: string, dealId: string, dto: LoseDealDto): Promise<DealDetail> {
    return this.db.query(schemaName, async (qr): Promise<DealDetail> => {
      await this.assertDealExists(qr, dealId)

      await qr.query(
        `UPDATE deals
         SET status = $1, loss_reason = $2, updated_at = NOW()
         WHERE id = $3 AND is_active = true`,
        [DealStatus.LOST, dto.lossReason ?? null, dealId],
      )

      return this.fetchDealOrFail(qr, dealId)
    })
  }

  // ─── Reopen ───────────────────────────────────────────────────────────────

  async reopen(schemaName: string, dealId: string): Promise<DealDetail> {
    return this.db.query(schemaName, async (qr): Promise<DealDetail> => {
      await this.assertDealExists(qr, dealId)

      await qr.query(
        `UPDATE deals
         SET status = $1, loss_reason = NULL, updated_at = NOW()
         WHERE id = $2 AND is_active = true`,
        [DealStatus.OPEN, dealId],
      )

      return this.fetchDealOrFail(qr, dealId)
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
    return this.mapDetail(row)
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
      stageId: r.stage_id,
      stageName: r.stage_name,
      pipelineId: r.pipeline_id,
      pipelineName: r.pipeline_name,
      contactId: r.contact_id,
      companyId: r.company_id,
      assignedToId: r.assigned_to_id,
      lossReason: r.loss_reason,
      status: r.status as DealStatus,
      isActive: r.is_active,
      createdById: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }

  private mapDetail(r: DealDetailRow): DealDetail {
    return {
      ...this.mapListItem(r),
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
}
