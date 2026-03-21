import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import type { Queue } from 'bullmq'
import Handlebars from 'handlebars'
import type {
  MessageTemplate,
  PaginatedTemplates,
  SendMessageResult,
  TemplateChannel,
  TemplateFormat,
  TemplatePreview,
} from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { QUEUE_NAMES } from '@/shared/queue/queue-names'
import type { MessageJobData } from './message-queue.processor'

interface TemplateRow {
  id: string
  name: string
  channel: string
  format: string
  subject: string | null
  body: string
  variables: string[]
  category: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

@Injectable()
export class MessageTemplatesService {
  constructor(
    private readonly db: TenantDbService,
    @InjectQueue(QUEUE_NAMES.MESSAGES) private readonly messageQueue: Queue<MessageJobData>,
  ) {}

  async findAll(
    schemaName: string,
    channel?: string,
    category?: string,
    page = 1,
    limit = 25,
  ): Promise<PaginatedTemplates> {
    return this.db.query(schemaName, async (qr): Promise<PaginatedTemplates> => {
      const conditions: string[] = ['is_active = true']
      const params: unknown[] = []

      if (channel) {
        params.push(channel)
        conditions.push(`channel = $${params.length}`)
      }
      if (category) {
        params.push(category)
        conditions.push(`category = $${params.length}`)
      }

      const where = conditions.join(' AND ')
      const countRows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count FROM message_templates WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const dataParams = [...params, limit, (page - 1) * limit]
      const rows: TemplateRow[] = await qr.query(
        `SELECT * FROM message_templates WHERE ${where} ORDER BY name ASC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { data: rows.map((r) => this.map(r)), total, page, limit }
    })
  }

  async findOne(schemaName: string, templateId: string): Promise<MessageTemplate> {
    return this.db.query(schemaName, async (qr): Promise<MessageTemplate> => {
      const rows: TemplateRow[] = await qr.query(`SELECT * FROM message_templates WHERE id = $1`, [
        templateId,
      ])
      if (!rows[0]) throw new NotFoundException(`Template ${templateId} not found`)
      return this.map(rows[0])
    })
  }

  async create(
    schemaName: string,
    data: {
      name: string
      channel: string
      format?: string
      subject?: string
      body: string
      variables?: string[]
      category?: string
    },
    userId: string,
  ): Promise<MessageTemplate> {
    return this.db.query(schemaName, async (qr): Promise<MessageTemplate> => {
      const detectedVars = data.variables ?? this.extractVariables(data.body, data.subject)

      const rows: TemplateRow[] = await qr.query(
        `INSERT INTO message_templates (name, channel, format, subject, body, variables, category, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          data.name,
          data.channel,
          data.format ?? 'handlebars',
          data.subject ?? null,
          data.body,
          detectedVars,
          data.category ?? null,
          userId,
        ],
      )
      const row = rows[0]
      if (!row) throw new Error('Failed to insert template')
      return this.map(row)
    })
  }

  async update(
    schemaName: string,
    templateId: string,
    data: Partial<{
      name: string
      subject: string
      body: string
      format: string
      variables: string[]
      category: string
    }>,
  ): Promise<MessageTemplate> {
    return this.db.query(schemaName, async (qr): Promise<MessageTemplate> => {
      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      const fieldMap: [string, string][] = [
        ['name', 'name'],
        ['subject', 'subject'],
        ['body', 'body'],
        ['format', 'format'],
        ['variables', 'variables'],
        ['category', 'category'],
      ]

      for (const [key, col] of fieldMap) {
        const val = data[key as keyof typeof data]
        if (val !== undefined) {
          params.push(val)
          sets.push(`${col} = $${params.length}`)
        }
      }

      if (data.body && !data.variables) {
        const detected = this.extractVariables(data.body, data.subject)
        params.push(detected)
        sets.push(`variables = $${params.length}`)
      }

      params.push(templateId)
      const rows: TemplateRow[] = await qr.query(
        `UPDATE message_templates SET ${sets.join(', ')} WHERE id = $${params.length} AND is_active = true RETURNING *`,
        params,
      )
      if (!rows[0]) throw new NotFoundException(`Template ${templateId} not found`)
      return this.map(rows[0])
    })
  }

  async remove(schemaName: string, templateId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      const rows: TemplateRow[] = await qr.query(
        `UPDATE message_templates SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id`,
        [templateId],
      )
      if (rows.length === 0) throw new NotFoundException(`Template ${templateId} not found`)
    })
  }

  async preview(
    schemaName: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<TemplatePreview> {
    const template = await this.findOne(schemaName, templateId)
    const rendered = this.render(template.body, template.format, variables)
    const subject = template.subject ? this.render(template.subject, 'text', variables) : null

    return {
      subject,
      body: template.body,
      renderedHtml: rendered,
    }
  }

  async send(
    schemaName: string,
    templateId: string,
    recipients: string[],
    variables: Record<string, string>,
    tenantId?: string,
  ): Promise<SendMessageResult> {
    const template = await this.findOne(schemaName, templateId)
    const renderedBody = this.render(template.body, template.format, variables)
    const renderedSubject = template.subject
      ? this.render(template.subject, 'text', variables)
      : null

    const jobs = recipients.map((recipient) => ({
      name: `send-${template.channel}`,
      data: {
        schemaName,
        tenantId: tenantId ?? '',
        templateId,
        channel: template.channel,
        recipient,
        subject: renderedSubject,
        renderedBody,
        variables,
      } satisfies MessageJobData,
    }))

    await this.messageQueue.addBulk(jobs)

    return {
      queued: recipients.length,
      templateName: template.name,
      channel: template.channel,
    }
  }

  async duplicate(
    schemaName: string,
    templateId: string,
    userId: string,
  ): Promise<MessageTemplate> {
    return this.db.query(schemaName, async (qr): Promise<MessageTemplate> => {
      const source = await this.findOne(schemaName, templateId)

      const rows: TemplateRow[] = await qr.query(
        `INSERT INTO message_templates (name, channel, format, subject, body, variables, category, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          `${source.name} (copy)`,
          source.channel,
          source.format,
          source.subject,
          source.body,
          source.variables,
          source.category,
          userId,
        ],
      )
      const row = rows[0]
      if (!row) throw new Error('Failed to insert template')
      return this.map(row)
    })
  }

  private render(
    text: string,
    format: TemplateFormat | string,
    variables: Record<string, string>,
  ): string {
    if (format === 'handlebars' || format === 'html') {
      const compiled = Handlebars.compile(text)
      return compiled(variables)
    }
    return text.replaceAll(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? `{{${key}}}`)
  }

  private extractVariables(body: string, subject?: string | null): string[] {
    const text = `${subject ?? ''} ${body}`
    const matches = text.matchAll(/\{\{(\w+)\}\}/g)
    return [...new Set([...matches].map((m) => m[1]!))]
  }

  private map(r: TemplateRow): MessageTemplate {
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
}
