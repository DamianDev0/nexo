import type { MessageTemplate, TemplateChannel, TemplateFormat } from '@repo/shared-types'
import type { TemplateRow } from '../interfaces/message-template-row.interfaces'

export function mapTemplate(r: TemplateRow): MessageTemplate {
  return {
    id: r.id,
    name: r.name,
    channel: r.channel as TemplateChannel,
    format: (r.format ?? 'handlebars') as TemplateFormat,
    subject: r.subject,
    body: r.body,
    variables: r.variables ?? [],
    category: r.category,
    isActive: r.is_active,
    createdById: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}
