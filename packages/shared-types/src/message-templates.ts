export type TemplateChannel = 'email' | 'sms' | 'whatsapp'
export type TemplateFormat = 'html' | 'text' | 'handlebars'

export type MessageTemplate = {
  id: string
  name: string
  channel: TemplateChannel
  format: TemplateFormat
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
  renderedHtml: string | null
}

export type SendMessageRequest = {
  templateId: string
  recipients: string[]
  variables: Record<string, string>
  scheduleAt?: string
}

export type SendMessageResult = {
  queued: number
  templateName: string
  channel: TemplateChannel
}
