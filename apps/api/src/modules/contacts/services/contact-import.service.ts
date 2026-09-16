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
import {
  IMPORT_BATCH_SIZE,
  IMPORT_MAX_ISSUES,
  IMPORT_UPDATABLE_COLUMNS,
} from '../constants/contact.constants'
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
      await this.importService.release(fileId, schemaName)
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
    const rows = candidates.map((candidate) => candidate.data)
    const matches = await this.repository.findImportMatches(qr, rows)
    const seen = new Set<string>()
    const inserts: CreateContactData[] = []
    let updated = 0
    let skipped = 0

    for (const data of rows) {
      const keys = importKeys(data)
      if (keys.some((key) => seen.has(key))) {
        skipped++
        continue
      }
      for (const key of keys) seen.add(key)

      const matchId = keys.map((key) => matches.get(key)).find((id) => id !== undefined)
      if (matchId === undefined) {
        inserts.push(data)
        continue
      }
      if (duplicateStrategy === 'update') {
        await this.repository.updateById(qr, matchId, toChanges(data))
        updated++
        continue
      }
      skipped++
    }

    for (let start = 0; start < inserts.length; start += IMPORT_BATCH_SIZE) {
      await this.repository.insertMany(qr, inserts.slice(start, start + IMPORT_BATCH_SIZE))
    }

    return { imported: inserts.length, updated, skipped }
  }
}

function importKeys(data: CreateContactData): string[] {
  const keys: string[] = []
  if (data.email) keys.push(`email:${data.email.toLowerCase()}`)
  if (data.documentNumber) keys.push(`document:${data.documentNumber}`)
  if (data.phone) keys.push(`phone:${data.phone}`)
  return keys
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
