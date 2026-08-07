import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { normalizeText } from '@repo/shared-utils'

import { DIVIPOLA } from '../data/divipola.data'
import { Municipality } from '../entities/municipality.entity'

const CHUNK_SIZE = 200

@Injectable()
export class GeoSeedService implements OnModuleInit {
  private readonly logger = new Logger(GeoSeedService.name)

  constructor(
    @InjectRepository(Municipality)
    private readonly municipalities: Repository<Municipality>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.municipalities.query(`
      CREATE TABLE IF NOT EXISTS public.co_municipalities (
        code CHAR(5) PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        search_name VARCHAR(120) NOT NULL,
        department_code CHAR(2) NOT NULL,
        department VARCHAR(120) NOT NULL,
        latitude NUMERIC(9, 6),
        longitude NUMERIC(9, 6)
      );
      CREATE INDEX IF NOT EXISTS idx_co_municipalities_department
        ON public.co_municipalities (department_code);
      CREATE INDEX IF NOT EXISTS idx_co_municipalities_search_trgm
        ON public.co_municipalities USING GIN (search_name gin_trgm_ops);
    `)

    const stored = await this.municipalities.count()
    if (stored === DIVIPOLA.length) return

    for (let i = 0; i < DIVIPOLA.length; i += CHUNK_SIZE) {
      const chunk = DIVIPOLA.slice(i, i + CHUNK_SIZE).map((row) => ({
        ...row,
        searchName: normalizeText(row.name),
      }))
      await this.municipalities.upsert(chunk, ['code'])
    }
    this.logger.log(`DIVIPOLA seeded — ${DIVIPOLA.length} municipalities`)
  }
}
