export type TemplateChannel = 'email' | 'sms' | 'whatsapp'

export type MessageTemplate = {
  id: string
  name: string
  channel: TemplateChannel
  subject: string | null
  body: string
  variables: string[]
  category: string | null
  isActive: boolean
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export type PaginatedTemplates = {
  data: MessageTemplate[]
  total: number
  page: number
  limit: number
}

export type TemplatePreview = {
  subject: string | null
  body: string
}
