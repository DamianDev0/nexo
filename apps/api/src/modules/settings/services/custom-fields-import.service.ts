import { Injectable } from '@nestjs/common'
import type { CustomFieldEntity, CustomFieldHeaderAnalysis } from '@repo/shared-types'
import { ImportService } from '@/shared/imports/services/import.service'
import { ImportFieldMapperService } from '@/shared/imports/services/import-field-mapper.service'
import type { UploadedImportFile } from '@/shared/imports/interfaces/import.interfaces'
import { TenantConfigService } from './tenant-config.service'
import { buildHeaderSuggestions } from '../mappers/custom-field-inference.mapper'

@Injectable()
export class CustomFieldsImportService {
  constructor(
    private readonly imports: ImportService,
    private readonly fieldMapper: ImportFieldMapperService,
    private readonly config: TenantConfigService,
  ) {}

  async analyzeHeaders(
    tenantId: string,
    entity: CustomFieldEntity,
    file: UploadedImportFile,
  ): Promise<CustomFieldHeaderAnalysis> {
    const parsed = await this.imports.parseHeaders(file)
    const columns = this.fieldMapper.analyzeColumns(parsed.columns, parsed.sampleRows, [])
    const existingDefs = (await this.config.getCustomFields(tenantId))[entity]

    return {
      entity,
      totalRows: parsed.totalRows,
      suggestions: buildHeaderSuggestions(columns, existingDefs),
    }
  }
}
