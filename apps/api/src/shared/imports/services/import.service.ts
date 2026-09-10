import { Injectable } from '@nestjs/common'
import { ImportFileParserService } from './import-file-parser.service'
import { ImportFieldMapperService } from './import-field-mapper.service'
import { ImportFileStoreService } from './import-file-store.service'
import type {
  AnalyzeResult,
  ImportFieldError,
  ImportRowMapper,
  ParsedFile,
  UploadedImportFile,
  ValidationPreview,
} from '../interfaces/import.interfaces'

@Injectable()
export class ImportService {
  constructor(
    private readonly parser: ImportFileParserService,
    private readonly fieldMapper: ImportFieldMapperService,
    private readonly fileStore: ImportFileStoreService,
  ) {}

  async parseHeaders(file: UploadedImportFile): Promise<ParsedFile> {
    this.parser.validateFile(file)
    return this.parser.analyze(file.buffer, file.originalname)
  }

  async analyze(
    file: UploadedImportFile,
    mapper: ImportRowMapper,
    scope: string,
  ): Promise<AnalyzeResult> {
    this.parser.validateFile(file)

    const { columns, sampleRows, totalRows } = await this.parser.analyze(
      file.buffer,
      file.originalname,
    )
    const fileId = this.fileStore.storeFile(file.buffer, file.originalname, scope)
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

  async preview(
    fileId: string,
    mapping: Record<string, string | null>,
    mapper: ImportRowMapper,
    scope: string,
  ): Promise<ValidationPreview> {
    const stored = this.fileStore.getFile(fileId, scope)
    const { sampleRows } = await this.parser.analyze(stored.buffer, stored.fileName)

    return this.fieldMapper.validateSampleRows(sampleRows, mapping, mapper)
  }

  release(fileId: string, scope: string): void {
    this.fileStore.removeFile(fileId, scope)
  }

  async getRowsForExecution(
    fileId: string,
    mapping: Record<string, string | null>,
    mapper: ImportRowMapper,
    scope: string,
  ): Promise<{
    rows: { data: Record<string, unknown>; errors: ImportFieldError[] }[]
    cleanup: () => void
  }> {
    const stored = this.fileStore.getFile(fileId, scope)
    const rawRows = await this.parser.parseAll(stored.buffer, stored.fileName)

    const rows = rawRows.map((raw) => {
      const { data, errors } = this.fieldMapper.mapRow(raw, mapping, mapper)

      for (const def of mapper.fieldDefs) {
        if (def.required && data[def.field] === undefined) {
          errors.push({ field: def.field, message: `${def.label} is required` })
        }
      }

      return { data, errors }
    })

    return {
      rows,
      cleanup: () => this.fileStore.removeFile(fileId, scope),
    }
  }
}
