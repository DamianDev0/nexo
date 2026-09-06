import { request } from '@/shared/api/request'

import type {
  AnalyzeResult,
  Contact,
  ContactCounts,
  ContactDuplicateProbeQuery,
  ContactDuplicateProbeResult,
  ContactInput,
  ContactListQuery,
  ContactTableState,
  ContactTaxonomyUsage,
  ContactTimeline,
  ContactView,
  ContactViewInput,
  ContactWorkspace,
  DuplicateStrategy,
  ImportResult,
  PaginatedContacts,
  TaxonomyReassignKind,
  ValidationPreview,
  ValidationReport,
} from '@repo/shared-types'

export type ContactImportRun = {
  fileId: string
  mapping: Record<string, string | null>
  duplicateStrategy?: DuplicateStrategy
}

function fileForm(file: File): FormData {
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

const contactsService = {
  analyzeImport: (file: File) =>
    request<AnalyzeResult>({
      method: 'post',
      url: '/contacts/import/analyze',
      data: fileForm(file),
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  previewImport: (data: ContactImportRun) =>
    request<ValidationPreview>({ method: 'post', url: '/contacts/import/preview', data }),

  validateImport: (data: ContactImportRun) =>
    request<ValidationReport>({ method: 'post', url: '/contacts/import/validate', data }),

  executeImport: (data: ContactImportRun) =>
    request<ImportResult>({ method: 'post', url: '/contacts/import/execute', data }),

  list: ({ advanced, ...params }: ContactListQuery) =>
    request<PaginatedContacts>({
      method: 'get',
      url: '/contacts',
      params: {
        ...params,
        advanced: advanced?.length ? JSON.stringify(advanced) : undefined,
      },
    }),

  counts: () => request<ContactCounts>({ method: 'get', url: '/contacts/counts' }),

  workspace: () => request<ContactWorkspace>({ method: 'get', url: '/contacts/workspace' }),

  createView: (data: ContactViewInput) =>
    request<ContactView>({ method: 'post', url: '/contacts/views', data }),

  updateView: (id: string, data: Partial<ContactViewInput>) =>
    request<ContactView>({ method: 'patch', url: `/contacts/views/${id}`, data }),

  deleteView: (id: string) => request<void>({ method: 'delete', url: `/contacts/views/${id}` }),

  duplicateView: (id: string) =>
    request<ContactView>({ method: 'post', url: `/contacts/views/${id}/duplicate` }),

  saveTableState: (tableState: ContactTableState) =>
    request<void>({ method: 'patch', url: '/contacts/workspace', data: { tableState } }),

  taxonomyUsage: () =>
    request<ContactTaxonomyUsage>({ method: 'get', url: '/contacts/taxonomy-usage' }),

  reassignTaxonomy: (data: { kind: TaxonomyReassignKind; fromKey: string; toKey: string }) =>
    request<{ reassigned: number }>({ method: 'patch', url: '/contacts/reassign-taxonomy', data }),

  probeDuplicates: (params: ContactDuplicateProbeQuery) =>
    request<ContactDuplicateProbeResult>({
      method: 'get',
      url: '/contacts/duplicates/probe',
      params,
    }),

  getById: (id: string) => request<Contact>({ method: 'get', url: `/contacts/${id}` }),

  create: (data: ContactInput, force?: boolean) =>
    request<Contact>({
      method: 'post',
      url: '/contacts',
      data,
      params: force ? { force } : undefined,
    }),

  update: (id: string, data: Partial<ContactInput>, force?: boolean) =>
    request<Contact>({
      method: 'patch',
      url: `/contacts/${id}`,
      data,
      params: force ? { force } : undefined,
    }),

  archive: (id: string) => request<void>({ method: 'delete', url: `/contacts/${id}` }),

  restore: (id: string) => request<Contact>({ method: 'post', url: `/contacts/${id}/restore` }),

  timeline: (id: string) =>
    request<ContactTimeline>({ method: 'get', url: `/contacts/${id}/timeline` }),
}

export default contactsService
