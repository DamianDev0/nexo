import type { DocumentType } from './enums'

export type Contact = {
  id: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  documentType: DocumentType | null
  documentNumber: string | null
  jobTitle: string | null
  linkedinUrl: string | null
  birthday: string | null
  address: string | null
  city: string | null
  department: string | null
  municipioCode: string | null
  country: string
  status: string
  statusChangedAt: string | null
  avatarUrl: string | null
  lifecycleStage: string
  source: string | null
  type: string | null
  typeLabel: string | null
  leadScore: number
  dataConsent: boolean
  consentDate: string | null
  consentSource: string | null
  optOutEmail: boolean
  optOutSms: boolean
  optOutWhatsapp: boolean
  lastContactedAt: string | null
  tags: string[]
  companyId: string | null
  assignedToId: string | null
  customFields: Record<string, unknown>
  isActive: boolean
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export type ContactListItem = Omit<Contact, 'customFields'> & {
  customFields?: Record<string, unknown>
}

export type ContactInput = {
  firstName: string
  lastName?: string
  email?: string
  phone?: string
  whatsapp?: string
  documentType?: DocumentType
  documentNumber?: string
  address?: string
  city?: string
  department?: string
  municipioCode?: string
  status?: string
  source?: string
  type?: string
  typeLabel?: string
  leadScore?: number
  tags?: string[]
  companyId?: string
  assignedToId?: string
  avatarUrl?: string
  customFields?: Record<string, unknown>
}

export type ContactListQuery = {
  q?: string
  status?: string
  source?: string
  lifecycleStage?: string
  tags?: string[]
  companyId?: string
  assignedToId?: string
  city?: string
  createdFrom?: string
  createdTo?: string
  lastContactedFrom?: string
  lastContactedTo?: string
  sortBy?: ContactSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export const CONTACT_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'firstName',
  'lastName',
  'email',
  'city',
  'status',
  'leadScore',
  'lastContactedAt',
] as const

export type ContactSortField = (typeof CONTACT_SORT_FIELDS)[number]

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
