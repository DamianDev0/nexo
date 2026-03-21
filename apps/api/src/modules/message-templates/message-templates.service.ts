import { Injectable, NotFoundException } from '@nestjs/common'
import type {
  MessageTemplate,
  PaginatedTemplates,
  TemplateChannel,
  TemplatePreview,
} from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'

interface TemplateRow {
  id: string
  name: string
  channel: string
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
  constructor(private readonly db: TenantDbService) {}

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
      subject?: string
      body: string
      variables?: string[]
      category?: string
    },
    userId: string,
  ): Promise<MessageTemplate> {
    return this.db.query(schemaName, async (qr): Promise<MessageTemplate> => {
      const rows: TemplateRow[] = await qr.query(
        `INSERT INTO message_templates (name, channel, subject, body, variables, category, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          data.name,
          data.channel,
          data.subject ?? null,
          data.body,
          data.variables ?? [],
          data.category ?? null,
          userId,
        ],
      )
      return this.map(rows[0]!)
    })
  }

  async update(
    schemaName: string,
    templateId: string,
    data: Partial<{
      name: string
      subject: string
      body: string
      variables: string[]
      category: string
    }>,
  ): Promise<MessageTemplate> {
    return this.db.query(schemaName, async (qr): Promise<MessageTemplate> => {
      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      for (const [key, col] of [
        ['name', 'name'],
        ['subject', 'subject'],
        ['body', 'body'],
        ['variables', 'variables'],
        ['category', 'category'],
      ] as const) {
        if (data[key] !== undefined) {
          params.push(data[key])
          sets.push(`${col} = $${params.length}`)
        }
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
    return {
      subject: template.subject ? this.interpolate(template.subject, variables) : null,
      body: this.interpolate(template.body, variables),
    }
  }

  private interpolate(text: string, variables: Record<string, string>): string {
    return text.replaceAll(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? `{{${key}}}`)
  }

  private map(r: TemplateRow): MessageTemplate {
    return {
      id: r.id,
      name: r.name,
      channel: r.channel as TemplateChannel,
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
