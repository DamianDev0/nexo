import type { DocumentType, ContactStatus, ContactSource } from './enums'

// ─── CONTACT ──────────────────────────────────────────────────────────────────

export type Contact = {
  id: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  documentType: DocumentType | null
  documentNumber: string | null
  city: string | null
  department: string | null
  municipioCode: string | null // DANE 5-digit code
  status: ContactStatus
  source: ContactSource | null
  leadScore: number
  tags: string[]
  companyId: string | null
  assignedToId: string | null
  customFields: Record<string, unknown>
  isActive: boolean
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export type ContactListItem = Omit<Contact, 'customFields'>

export type PaginatedContacts = {
  data: ContactListItem[]
  total: number
  page: number
  limit: number
}

export type ContactTimeline = {
  activities: ContactActivity[]
  deals: ContactDeal[]
}

export type ContactActivity = {
  id: string
  activityType: string
  title: string | null
  description: string | null
  dueDate: string | null
  completedAt: string | null
  assignedToId: string | null
  createdById: string | null
  createdAt: string
}

export type ContactDeal = {
  id: string
  title: string
  valueCents: number
  status: string
  stageId: string | null
  pipelineId: string | null
  expectedCloseDate: string | null
  createdAt: string
}
