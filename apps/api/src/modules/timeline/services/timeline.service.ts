import { Injectable } from '@nestjs/common'
import type { PaginatedTimeline } from '@repo/shared-types'
import { DEFAULT_PAGE_SIZE } from '@repo/shared-utils'
import { TimelineRepository } from '../repositories/timeline.repository'
import { mapTimelineRow } from '../mappers/timeline.mapper'

@Injectable()
export class TimelineService {
  constructor(private readonly timelineRepository: TimelineRepository) {}

  async getContactTimeline(
    schemaName: string,
    contactId: string,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedTimeline> {
    return this.getTimeline(schemaName, 'contact_id', contactId, page, limit)
  }

  async getDealTimeline(
    schemaName: string,
    dealId: string,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedTimeline> {
    return this.getTimeline(schemaName, 'deal_id', dealId, page, limit)
  }

  async getCompanyTimeline(
    schemaName: string,
    companyId: string,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedTimeline> {
    return this.getTimeline(schemaName, 'company_id', companyId, page, limit)
  }

  private async getTimeline(
    schemaName: string,
    filterCol: string,
    filterId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedTimeline> {
    const offset = (page - 1) * limit
    const { rows, total } = await this.timelineRepository.findTimelinePage(
      schemaName,
      filterCol,
      filterId,
      limit,
      offset,
    )

    return {
      data: rows.map(mapTimelineRow),
      total,
      page,
      limit,
    }
  }
}
