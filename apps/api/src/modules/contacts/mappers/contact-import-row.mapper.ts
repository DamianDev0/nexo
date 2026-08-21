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
  },
): CreateContactData {
  const leadScore = data['leadScore']

  return {
    firstName: resolved.firstName,
    lastName: text(data, 'lastName'),
    email: text(data, 'email'),
    phone: text(data, 'phone'),
    whatsapp: text(data, 'whatsapp'),
    documentType: resolved.documentType,
    documentNumber: resolved.documentNumber,
    jobTitle: text(data, 'jobTitle'),
    linkedinUrl: null,
    birthday: null,
    address: text(data, 'address'),
    city: text(data, 'city'),
    department: text(data, 'department'),
    municipioCode: null,
    status: resolved.status,
    lifecycleStage: resolved.lifecycleStage,
    source: text(data, 'source') ?? 'import',
    type: text(data, 'type'),
    typeLabel: null,
    avatarUrl: null,
    leadScore: typeof leadScore === 'number' ? leadScore : 0,
    dataConsent: false,
    consentDate: null,
    consentSource: null,
    optOutEmail: false,
    optOutSms: false,
    optOutWhatsapp: false,
    tags: resolved.tags,
    companyId: null,
    assignedToId: null,
    customFields: collectCustomFields(data),
    createdBy: resolved.createdById ?? '',
  }
}

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

    const rawStage = text(data, 'lifecycleStage')
    let lifecycleStage = rawStage ?? defaultStage
    if (rawStage && !knownStages.has(rawStage)) {
      warningRows++
      issues.push({
        row,
        severity: 'warning',
        field: 'lifecycleStage',
        message: 'Lifecycle stage is not in the catalog; the default stage will be used',
        value: rawStage,
      })
      lifecycleStage = defaultStage
    }

    candidates.push({
      rowNumber: row,
      data: toContactData(data, {
        firstName,
        documentType,
        documentNumber,
        tags,
        createdById,
        lifecycleStage,
        status: text(data, 'status') ?? defaultStatus,
      }),
    })
  }

  return { candidates, issues, errorRows, warningRows }
}
