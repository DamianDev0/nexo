import { DEFAULT_CONTACT_TAXONOMY, firstEnabledOptionKey } from '@repo/shared-types'
import type { ContactTaxonomy, ImportFieldError, ImportIssue } from '@repo/shared-types'
import { IMPORT_HEADER_OFFSET } from '@/shared/imports/constants/import.constants'
import { CUSTOM_FIELD_PREFIX, documentNumberError } from '../constants/contact-import.mapper'
import type { CreateContactData } from '../interfaces/contact-row.interfaces'

export interface ImportSourceRow {
  data: Record<string, unknown>
  errors: ImportFieldError[]
}

export interface ImportCandidate {
  rowNumber: number
  data: CreateContactData
}

export interface ImportRowsResult {
  candidates: ImportCandidate[]
  issues: ImportIssue[]
  errorRows: number
  warningRows: number
}

function text(data: Record<string, unknown>, field: string): string | null {
  const value = data[field]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function collectCustomFields(data: Record<string, unknown>): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (!key.startsWith(CUSTOM_FIELD_PREFIX)) continue
    if (value === null || value === undefined || value === '') continue
    values[key.slice(CUSTOM_FIELD_PREFIX.length)] = value
  }
  return values
}

function splitTags(
  value: unknown,
  canonicalTag: ReadonlyMap<string, string>,
): { tags: string[]; ignored: string[] } {
  if (!Array.isArray(value)) return { tags: [], ignored: [] }

  const tags: string[] = []
  const ignored: string[] = []

  for (const raw of value as string[]) {
    const canonical = canonicalTag.get(raw.toLowerCase())
    if (!canonical) ignored.push(raw)
    else if (!tags.includes(canonical)) tags.push(canonical)
  }

  return { tags, ignored }
}

function toContactData(
  data: Record<string, unknown>,
  resolved: {
    firstName: string
    documentType: string | null
    documentNumber: string | null
    tags: string[]
    createdById: string | null
    lifecycleStage: string
    status: string
    source: string | null
  },
): CreateContactData {
  return {
    firstName: resolved.firstName,
    lastName: text(data, 'lastName'),
    email: text(data, 'email'),
    phone: text(data, 'phone'),
    whatsapp: text(data, 'whatsapp'),
    documentType: resolved.documentType,
    documentNumber: resolved.documentNumber,
    avatarUrl: null,
    city: text(data, 'city'),
    municipioCode: null,
    status: resolved.status,
    lifecycleStage: resolved.lifecycleStage,
    source: resolved.source,
    tags: resolved.tags,
    companyId: null,
    assignedToId: null,
    customFields: collectCustomFields(data),
    createdBy: resolved.createdById ?? '',
  }
}

const IMPORT_SOURCE_KEY = 'import'

export function buildImportRows(
  rows: ImportSourceRow[],
  catalog: string[],
  createdById: string | null,
  taxonomy: ContactTaxonomy = DEFAULT_CONTACT_TAXONOMY,
): ImportRowsResult {
  const canonicalTag = new Map(catalog.map((tag) => [tag.toLowerCase(), tag]))
  const knownStages = new Set(
    taxonomy.lifecycleStages.filter((stage) => stage.enabled).map((stage) => stage.key),
  )
  const knownStatuses = new Set(
    taxonomy.statuses.filter((option) => option.enabled).map((option) => option.key),
  )
  const knownSources = new Set(
    taxonomy.sources.filter((option) => option.enabled).map((option) => option.key),
  )
  const importSource = knownSources.has(IMPORT_SOURCE_KEY) ? IMPORT_SOURCE_KEY : null
  const defaultStage = firstEnabledOptionKey(taxonomy.lifecycleStages)
  const defaultStatus = firstEnabledOptionKey(taxonomy.statuses)
  const candidates: ImportCandidate[] = []
  const issues: ImportIssue[] = []
  let errorRows = 0
  let warningRows = 0

  for (const [index, { data, errors }] of rows.entries()) {
    const row = index + IMPORT_HEADER_OFFSET

    if (errors.length > 0) {
      errorRows++
      for (const error of errors) {
        issues.push({
          row,
          severity: 'error',
          field: error.field,
          message: error.message,
          value: error.value ?? null,
        })
      }
      continue
    }

    const firstName = text(data, 'firstName')
    if (!firstName) {
      errorRows++
      issues.push({
        row,
        severity: 'error',
        field: 'firstName',
        message: 'First name is required',
        value: null,
      })
      continue
    }

    const documentType = text(data, 'documentType')
    const documentNumber = text(data, 'documentNumber')
    const documentError = documentNumberError(documentType, documentNumber)
    if (documentError) {
      errorRows++
      issues.push({
        row,
        severity: 'error',
        field: 'documentNumber',
        message: documentError,
        value: documentNumber,
      })
      continue
    }

    const { tags, ignored } = splitTags(data['tags'], canonicalTag)
    if (ignored.length > 0) {
      warningRows++
      issues.push({
        row,
        severity: 'warning',
        field: 'tags',
        message: 'Tags that are not in the catalog will be ignored',
        value: ignored.join(', '),
      })
    }

    const taxonomyValue = (
      field: 'lifecycleStage' | 'status' | 'source',
      known: ReadonlySet<string>,
      fallback: string | null,
    ): string | null => {
      const raw = text(data, field)
      if (!raw) return fallback
      if (known.has(raw)) return raw
      warningRows++
      issues.push({
        row,
        severity: 'warning',
        field,
        message: `Value is not in the ${field} catalog; the default will be used`,
        value: raw,
      })
      return fallback
    }

    candidates.push({
      rowNumber: row,
      data: toContactData(data, {
        firstName,
        documentType,
        documentNumber,
        tags,
        createdById,
        lifecycleStage: taxonomyValue('lifecycleStage', knownStages, defaultStage) ?? defaultStage,
        status: taxonomyValue('status', knownStatuses, defaultStatus) ?? defaultStatus,
        source: taxonomyValue('source', knownSources, importSource),
      }),
    })
  }

  return { candidates, issues, errorRows, warningRows }
}
