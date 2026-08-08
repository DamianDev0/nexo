import { Injectable } from '@nestjs/common'
import type { ForecastEntry } from '@repo/shared-types'
import { DealsRepository } from '../repositories/deals.repository'
import { mapForecastEntry } from '../mappers/deal.mapper'

@Injectable()
export class DealForecastService {
  constructor(private readonly repository: DealsRepository) {}

  async getForecast(schemaName: string, months = 6): Promise<ForecastEntry[]> {
    const rows = await this.repository.getForecast(schemaName, months)
    return rows.map(mapForecastEntry)
  }
}
