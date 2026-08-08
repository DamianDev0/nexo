import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'

import { normalizeText } from '@repo/shared-utils'

import { DIVIPOLA } from '../data/divipola.data'
import { GeoRepository } from '../repositories/geo.repository'

const CHUNK_SIZE = 200

@Injectable()
export class GeoSeedService implements OnModuleInit {
  private readonly logger = new Logger(GeoSeedService.name)

  constructor(private readonly repository: GeoRepository) {}

  async onModuleInit(): Promise<void> {
    await this.repository.ensureMunicipalityTable()

    const stored = await this.repository.countMunicipalities()
    if (stored === DIVIPOLA.length) return

    for (let i = 0; i < DIVIPOLA.length; i += CHUNK_SIZE) {
      const chunk = DIVIPOLA.slice(i, i + CHUNK_SIZE).map((row) => ({
        ...row,
        searchName: normalizeText(row.name),
      }))
      await this.repository.upsertMunicipalities(chunk)
    }
    this.logger.log(`DIVIPOLA seeded — ${DIVIPOLA.length} municipalities`)
  }
}
