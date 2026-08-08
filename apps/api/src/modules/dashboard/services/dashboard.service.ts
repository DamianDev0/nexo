import { Injectable } from '@nestjs/common'
import type {
  DashboardMetrics,
  OverdueInvoice,
  PipelineSummary,
  RevenueByMonth,
  TodayActivity,
  TopSalesRep,
} from '@repo/shared-types'
import { CacheService } from '@/shared/cache/cache.service'
import { DashboardRepository } from '../repositories/dashboard.repository'
import {
  buildMetrics,
  groupPipelineSummary,
  mapOverdueInvoice,
  mapRevenueByMonth,
  mapTodayActivity,
  mapTopSalesRep,
} from '../mappers/dashboard.mapper'
import { CACHE_TTL_SHORT_SECONDS } from '@/shared/cache/cache.constants'

@Injectable()
export class DashboardService {
  constructor(
    private readonly repo: DashboardRepository,
    private readonly cache: CacheService,
  ) {}

  async getMetrics(schemaName: string, tenantId: string): Promise<DashboardMetrics> {
    const cacheKey = `dashboard:metrics:${tenantId}`
    const cached = await this.cache.get<DashboardMetrics>(cacheKey)
    if (cached) return cached

    const metrics = buildMetrics(await this.repo.findMetrics(schemaName))

    await this.cache.set(cacheKey, metrics, CACHE_TTL_SHORT_SECONDS)
    return metrics
  }

  async getPipelineSummary(schemaName: string): Promise<PipelineSummary[]> {
    const rows = await this.repo.findPipelineSummaryRows(schemaName)
    return groupPipelineSummary(rows)
  }

  async getTodayActivities(schemaName: string, userId: string): Promise<TodayActivity[]> {
    const rows = await this.repo.findTodayActivityRows(schemaName, userId)
    return rows.map(mapTodayActivity)
  }

  async getOverdueInvoices(schemaName: string, limit = 5): Promise<OverdueInvoice[]> {
    const rows = await this.repo.findOverdueInvoiceRows(schemaName, limit)
    return rows.map(mapOverdueInvoice)
  }

  async getTopSalesReps(schemaName: string, limit = 5): Promise<TopSalesRep[]> {
    const rows = await this.repo.findTopSalesRepRows(schemaName, limit)
    return rows.map(mapTopSalesRep)
  }

  async getRevenueByMonth(schemaName: string, months = 6): Promise<RevenueByMonth[]> {
    const rows = await this.repo.findRevenueByMonthRows(schemaName, months)
    return rows.map(mapRevenueByMonth)
  }

  async invalidateCache(tenantId: string): Promise<void> {
    await this.cache.del(`dashboard:metrics:${tenantId}`)
  }
}
