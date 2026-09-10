import { Injectable } from '@nestjs/common'
import { DEFAULT_CONTACT_TAXONOMY } from '@repo/shared-types'
import type {
  AnalyzeResult,
  ContactTaxonomy,
  DuplicateStrategy,
  FieldDef,
  ImportResult,
  ValidationPreview,
  ValidationReport,
} from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { ImportService } from '@/shared/imports/services/import.service'
import type { UploadedImportFile } from '@/shared/imports/interfaces/import.interfaces'
import { contactImportMapperFor } from '../constants/contact-import.mapper'
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

  async analyze(
    schemaName: string,
    file: UploadedImportFile,
    customFields: FieldDef[] = [],
  ): Promise<AnalyzeResult> {
    return this.importService.analyze(file, contactImportMapperFor(customFields), schemaName)
  }

  async preview(
    schemaName: string,
    fileId: string,
    mapping: Mapping,
    customFields: FieldDef[] = [],
  ): Promise<ValidationPreview> {
    return this.importService.preview(
      fileId,
      mapping,
      contactImportMapperFor(customFields),
      schemaName,
    )
  }

  async validate(
    schemaName: string,
    fileId: string,
    mapping: Mapping,
    taxonomy: ContactTaxonomy = DEFAULT_CONTACT_TAXONOMY,
    customFields: FieldDef[] = [],
  ): Promise<ValidationReport> {
    const rows = await this.readRows(schemaName, fileId, mapping, customFields)

    return this.db.query(schemaName, async (qr): Promise<ValidationReport> => {
      const catalog = await this.repository.findEnabledTagNames(qr)
      const { candidates, issues, errorRows, warningRows } = buildImportRows(
        rows,
        catalog,
        null,
        taxonomy,
      )

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
    taxonomy: ContactTaxonomy = DEFAULT_CONTACT_TAXONOMY,
    customFields: FieldDef[] = [],
  ): Promise<ImportResult> {
    const rows = await this.readRows(schemaName, fileId, mapping, customFields)

    try {
      return await this.db.transactional(schemaName, async (qr): Promise<ImportResult> => {
        const catalog = await this.repository.findEnabledTagNames(qr)
        const { candidates, issues, errorRows } = buildImportRows(
          rows,
          catalog,
          createdById,
          taxonomy,
        )
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
      this.importService.release(fileId, schemaName)
    }
  }

  private async readRows(
    schemaName: string,
    fileId: string,
    mapping: Mapping,
    customFields: FieldDef[],
  ): Promise<ImportSourceRow[]> {
    const { rows } = await this.importService.getRowsForExecution(
      fileId,
      mapping,
      contactImportMapperFor(customFields),
      schemaName,
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
  const changes: ContactColumnChange[] = IMPORT_UPDATABLE_COLUMNS.filter(
    ([key]) => data[key] !== null,
  ).map(([key, column]) => ({ column, value: data[key] }))

  if (Object.keys(data.customFields).length > 0) {
    changes.push({ column: 'custom_fields', value: data.customFields })
  }
  return changes
}
