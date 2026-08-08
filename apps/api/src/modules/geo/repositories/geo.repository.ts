import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { Department, Municipality as MunicipalityDto } from '@repo/shared-types'
import { normalizeText } from '@repo/shared-utils'
import { Repository } from 'typeorm'

import { Municipality } from '../entities/municipality.entity'
import type { MunicipalitySeed } from '../interfaces/municipality-seed.interface'

const SEARCH_LIMIT = 10

@Injectable()
export class GeoRepository {
  constructor(
    @InjectRepository(Municipality)
    private readonly municipalities: Repository<Municipality>,
  ) {}

  async listDepartments(): Promise<Department[]> {
    const rows = await this.municipalities
      .createQueryBuilder('m')
      .select('m.department_code', 'code')
      .addSelect('m.department', 'name')
      .distinct(true)
      .orderBy('m.department', 'ASC')
      .getRawMany<Department>()
    return rows
  }

  async searchMunicipalities(term: string, departmentCode?: string): Promise<MunicipalityDto[]> {
    const query = this.municipalities
      .createQueryBuilder('m')
      .select(['m.code AS code', 'm.name AS name'])
      .addSelect('m.department_code', 'departmentCode')
      .addSelect('m.department', 'department')

    const needle = normalizeText(term)
    if (needle) {
      query
        .addSelect('CASE WHEN m.search_name LIKE :prefix THEN 0 ELSE 1 END', 'match_rank')
        .where('m.search_name LIKE :anywhere', { anywhere: `%${needle}%` })
        .setParameter('prefix', `${needle}%`)
        .orderBy('match_rank', 'ASC')
    }
    if (departmentCode) {
      query.andWhere('m.department_code = :departmentCode', { departmentCode })
    }

    return query.addOrderBy('m.name', 'ASC').limit(SEARCH_LIMIT).getRawMany<MunicipalityDto>()
  }

  async ensureMunicipalityTable(): Promise<void> {
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
  }

  async countMunicipalities(): Promise<number> {
    return this.municipalities.count()
  }

  async upsertMunicipalities(
    rows: Array<MunicipalitySeed & { searchName: string }>,
  ): Promise<void> {
    await this.municipalities.upsert(rows, ['code'])
  }
}
