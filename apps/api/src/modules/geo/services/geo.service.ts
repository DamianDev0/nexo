import { Injectable } from '@nestjs/common'
import type { Department, Municipality as MunicipalityDto } from '@repo/shared-types'

import { GeoRepository } from '../repositories/geo.repository'

@Injectable()
export class GeoService {
  constructor(private readonly repository: GeoRepository) {}

  async listDepartments(): Promise<Department[]> {
    return this.repository.listDepartments()
  }

  async searchMunicipalities(term: string, departmentCode?: string): Promise<MunicipalityDto[]> {
    return this.repository.searchMunicipalities(term, departmentCode)
  }
}
