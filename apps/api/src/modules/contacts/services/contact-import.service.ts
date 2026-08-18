import { Injectable } from '@nestjs/common'
import type {
  AnalyzeResult,
  DuplicateStrategy,
  ImportResult,
  ValidationPreview,
  ValidationReport,
} from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { ImportService } from '@/shared/imports/services/import.service'
import type { UploadedImportFile } from '@/shared/imports/interfaces/import.interfaces'
import { contactImportMapper } from '../constants/contact-import.mapper'
import { IMPORT_MAX_ISSUES, IMPORT_UPDATABLE_COLUMNS } from '../constants/contact.constants'
import { buildImportRows } from '../mappers/contact-import-row.mapper'
import { ContactsRepository } from '../repositories/contacts.repository'
import type { ImportSourceRow } from '../mappers/contact-import-row.mapper'
import type { ContactColumnChange, CreateContactData } from '../interfaces/contact-row.interfaces'
import type { QueryRunner } from 'typeorm'

type Mapping = Record<string, string | null>

@Injectable()
export class ContactImportService {
  constructor(
    private readonly db: TenantDbService,
    private readonly repository: ContactsRepository,
    private readonly importService: ImportService,
  ) {}

  async analyze(file: UploadedImportFile): Promise<AnalyzeResult> {
    return this.importService.analyze(file, contactImportMapper)
  }

  async preview(fileId: string, mapping: Mapping): Promise<ValidationPreview> {
    return this.importService.preview(fileId, mapping, contactImportMapper)
  }

  async validate(schemaName: string, fileId: string, mapping: Mapping): Promise<ValidationReport> {
    const rows = await this.readRows(fileId, mapping)

    return this.db.query(schemaName, async (qr): Promise<ValidationReport> => {
      const catalog = await this.repository.findEnabledTagNames(qr)
      const { candidates, issues, errorRows, warningRows } = buildImportRows(rows, catalog, null)

      return {
        totalRows: rows.length,
        readyRows: candidates.length,
        warningRows,
        errorRows,
        issues: issues.slice(0, IMPORT_MAX_ISSUES),
        truncatedIssues: issues.length > IMPORT_MAX_ISSUES,
      }
    })
  }

  async execute(
    schemaName: string,
    fileId: string,
    mapping: Mapping,
    duplicateStrategy: DuplicateStrategy,
    createdById: string,
  ): Promise<ImportResult> {
    const rows = await this.readRows(fileId, mapping)

    try {
      return await this.db.transactional(schemaName, async (qr): Promise<ImportResult> => {
        const catalog = await this.repository.findEnabledTagNames(qr)
        const { candidates, issues, errorRows } = buildImportRows(rows, catalog, createdById)
        const counts = await this.writeCandidates(qr, candidates, duplicateStrategy)

        return {
          imported: counts.imported,
          updated: counts.updated,
          skipped: errorRows + counts.skipped,
          errors: issues.slice(0, IMPORT_MAX_ISSUES).map((issue) => ({
            row: issue.row,
            message: issue.value ? `${issue.message}: ${issue.value}` : issue.message,
          })),
        }
      })
    } finally {
      this.importService.release(fileId)
    }
  }

  private async readRows(fileId: string, mapping: Mapping): Promise<ImportSourceRow[]> {
    const { rows } = await this.importService.getRowsForExecution(
      fileId,
      mapping,
      contactImportMapper,
    )
    return rows
  }

  private async writeCandidates(
    qr: QueryRunner,
    candidates: ReadonlyArray<{ data: CreateContactData }>,
    duplicateStrategy: DuplicateStrategy,
  ): Promise<{ imported: number; updated: number; skipped: number }> {
    let imported = 0
    let updated = 0
    let skipped = 0

    for (const { data } of candidates) {
      const matchId = await this.repository.findImportMatchId(qr, data.email, data.documentNumber)

      if (matchId && duplicateStrategy === 'skip') {
        skipped++
        continue
      }

      if (matchId && duplicateStrategy === 'update') {
        await this.repository.updateById(qr, matchId, toChanges(data))
        updated++
        continue
      }

      await this.repository.insert(qr, data)
      imported++
    }

    return { imported, updated, skipped }
  }
}

function toChanges(data: CreateContactData): ContactColumnChange[] {
  return IMPORT_UPDATABLE_COLUMNS.filter(([key]) => data[key] !== null).map(([key, column]) => ({
    column,
    value: data[key],
  }))
}
