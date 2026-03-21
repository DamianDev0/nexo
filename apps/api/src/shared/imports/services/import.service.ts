import { Injectable } from '@nestjs/common'
import { ImportCsvParserService } from './import-csv-parser.service'
import { ImportFieldMapperService } from './import-field-mapper.service'
import { ImportFileStoreService } from './import-file-store.service'
import type { AnalyzeResult, ImportRowMapper } from '../interfaces/import.interfaces'

@Injectable()
export class ImportService {
  constructor(
    private readonly csvParser: ImportCsvParserService,
    private readonly fieldMapper: ImportFieldMapperService,
    private readonly fileStore: ImportFileStoreService,
  ) {}

  async analyze(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    mapper: ImportRowMapper,
  ): Promise<AnalyzeResult> {
    this.csvParser.validateFile(file)

    const { columns, sampleRows, totalRows } = await this.csvParser.analyze(file.buffer)
    const fileId = this.fileStore.storeFile(file.buffer, file.originalname)
    const suggestedMapping = this.fieldMapper.suggestMapping(columns, mapper.fieldDefs)
    const columnAnalysis = this.fieldMapper.analyzeColumns(columns, sampleRows, mapper.fieldDefs)
    const validationPreview = this.fieldMapper.validateSampleRows(
      sampleRows,
      suggestedMapping,
      mapper,
    )
    const unmappedColumns = columns.filter((col) => !suggestedMapping[col])
    const missingRequiredFields = this.fieldMapper.findMissingRequiredFields(
      suggestedMapping,
      mapper.fieldDefs,
    )

    return {
      fileId,
      fileName: file.originalname,
      totalRows,
      columns,
      sampleRows,
      suggestedMapping,
      availableFields: mapper.fieldDefs,
      columnAnalysis,
      validationPreview,
      unmappedColumns,
      missingRequiredFields,
    }
  }

  async getRowsForExecution(
    fileId: string,
    mapping: Record<string, string | null>,
    mapper: ImportRowMapper,
  ): Promise<{
    rows: { data: Record<string, unknown>; errors: string[] }[]
    cleanup: () => void
  }> {
    const buffer = this.fileStore.getBuffer(fileId)
    const rawRows = await this.csvParser.parseAll(buffer)

    const rows = rawRows.map((raw, i) => {
      const { data, errors } = this.fieldMapper.mapRow(raw, mapping, mapper)

      for (const def of mapper.fieldDefs) {
        if (def.required && data[def.field] === undefined) {
          errors.push({ field: def.field, message: `${def.label} is required` })
        }
      }

      return {
        data,
        errors: errors.map((e) => `Row ${i + 2}: ${e.field} — ${e.message}`),
      }
    })

    return {
      rows,
      cleanup: () => this.fileStore.removeFile(fileId),
    }
  }
}
