import { Injectable } from '@nestjs/common'
import type { DealDetail, PaginatedDeals } from '@repo/shared-types'
import { DEFAULT_PAGE_SIZE } from '@repo/shared-utils'
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service'
import { AuditAction, AuditEntityType } from '@/modules/audit-log/interfaces/audit-log.interfaces'
import { DealsRepository } from '../repositories/deals.repository'
import { mapDealDetail, mapDealItem, mapDealListItem } from '../mappers/deal.mapper'
import type { DealWithItemsRow } from '../interfaces/deal-row.interfaces'
import type {
  CreateDealDto,
  DealQueryDto,
  LoseDealDto,
  MoveDealDto,
  UpdateDealDto,
} from '../dto/deal.dto'

@Injectable()
export class DealsService {
  constructor(
    private readonly repository: DealsRepository,
    private readonly audit: AuditLogService,
  ) {}

  async findAll(schemaName: string, query: DealQueryDto): Promise<PaginatedDeals> {
    const page = query.page ?? 1
    const limit = query.limit ?? DEFAULT_PAGE_SIZE
    const offset = (page - 1) * limit

    const { rows, total } = await this.repository.findPage(schemaName, query, limit, offset)

    return { data: rows.map(mapDealListItem), total, page, limit }
  }

  async findOne(schemaName: string, dealId: string): Promise<DealDetail> {
    return this.toDetail(await this.repository.findDetail(schemaName, dealId))
  }

  async create(schemaName: string, dto: CreateDealDto, createdById: string): Promise<DealDetail> {
    const result = this.toDetail(await this.repository.create(schemaName, dto, createdById))
    void this.audit.entityEvent(
      schemaName,
      AuditAction.DealCreated,
      AuditEntityType.Deal,
      result.id,
      createdById,
      `Deal "${dto.title}" created`,
    )
    return result
  }

  async update(schemaName: string, dealId: string, dto: UpdateDealDto): Promise<DealDetail> {
    const result = this.toDetail(await this.repository.update(schemaName, dealId, dto))
    void this.audit.entityEvent(
      schemaName,
      AuditAction.DealUpdated,
      AuditEntityType.Deal,
      dealId,
      undefined,
      `Deal ${dealId} updated`,
    )
    return result
  }

  async remove(schemaName: string, dealId: string): Promise<void> {
    await this.repository.softDelete(schemaName, dealId)
    void this.audit.entityEvent(
      schemaName,
      AuditAction.DealDeleted,
      AuditEntityType.Deal,
      dealId,
      undefined,
      `Deal ${dealId} deleted`,
    )
  }

  async moveStage(
    schemaName: string,
    dealId: string,
    dto: MoveDealDto,
    userId?: string,
  ): Promise<DealDetail> {
    const { deal, items, fromStageId } = await this.repository.moveStage(
      schemaName,
      dealId,
      dto.stageId,
      dto.pipelineId,
      userId ?? null,
    )
    const result = this.toDetail({ deal, items })
    void this.audit.entityEvent(
      schemaName,
      AuditAction.DealStageChanged,
      AuditEntityType.Deal,
      dealId,
      userId,
      `Deal ${dealId} moved to stage ${dto.stageId}`,
      { oldValue: { stageId: fromStageId }, newValue: { stageId: dto.stageId } },
    )
    return result
  }

  async markWon(schemaName: string, dealId: string, userId?: string): Promise<DealDetail> {
    const result = this.toDetail(await this.repository.markWon(schemaName, dealId, userId ?? null))
    void this.audit.entityEvent(
      schemaName,
      AuditAction.DealWon,
      AuditEntityType.Deal,
      dealId,
      userId,
      `Deal ${dealId} marked as won`,
    )
    return result
  }

  async markLost(
    schemaName: string,
    dealId: string,
    dto: LoseDealDto,
    userId?: string,
  ): Promise<DealDetail> {
    const result = this.toDetail(
      await this.repository.markLost(schemaName, dealId, dto.lossReason, userId ?? null),
    )
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
  }

  async reopen(schemaName: string, dealId: string, userId?: string): Promise<DealDetail> {
    return this.toDetail(await this.repository.reopen(schemaName, dealId, userId ?? null))
  }

  private toDetail({ deal, items }: DealWithItemsRow): DealDetail {
    return { ...mapDealDetail(deal), items: items.map(mapDealItem) }
  }
}
