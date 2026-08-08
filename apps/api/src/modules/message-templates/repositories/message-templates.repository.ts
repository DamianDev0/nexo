import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  TemplateInsertValues,
  TemplateListResult,
  TemplateRow,
} from '../interfaces/message-template-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class MessageTemplatesRepository {
  constructor(private readonly db: TenantDbService) {}

  async findAll(
    schemaName: string,
    filters: { channel?: string; category?: string; limit: number; offset: number },
  ): Promise<TemplateListResult> {
    return this.db.query(schemaName, async (qr): Promise<TemplateListResult> => {
      const conditions: string[] = ['is_active = true']
      const params: unknown[] = []

      if (filters.channel) {
        params.push(filters.channel)
        conditions.push(`channel = $${params.length}`)
      }
      if (filters.category) {
        params.push(filters.category)
        conditions.push(`category = $${params.length}`)
      }

      const where = conditions.join(' AND ')
      const countRows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM message_templates WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const dataParams = [...params, filters.limit, filters.offset]
      const rows = await sqlRows<TemplateRow[]>(
        qr,
        `SELECT * FROM message_templates WHERE ${where} ORDER BY name ASC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { rows, total }
    })
  }

  async findById(schemaName: string, templateId: string): Promise<TemplateRow | null> {
    return this.db.query(schemaName, async (qr): Promise<TemplateRow | null> => {
      const rows = await sqlRows<TemplateRow[]>(
        qr,
        `SELECT * FROM message_templates WHERE id = $1`,
        [templateId],
      )
      return rows[0] ?? null
    })
  }

  async insert(schemaName: string, values: TemplateInsertValues): Promise<TemplateRow> {
    return this.db.query(schemaName, async (qr): Promise<TemplateRow> => {
      const rows = await sqlRows<TemplateRow[]>(
        qr,
        `INSERT INTO message_templates (name, channel, format, subject, body, variables, category, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          values.name,
          values.channel,
          values.format,
          values.subject,
          values.body,
          values.variables,
          values.category,
          values.createdBy,
        ],
      )
      const row = rows[0]
      if (!row) throw new Error('Failed to insert template')
      return row
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
    detectedVariables?: string[],
  ): Promise<TemplateRow | null> {
    return this.db.query(schemaName, async (qr): Promise<TemplateRow | null> => {
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

      if (detectedVariables) {
        params.push(detectedVariables)
        sets.push(`variables = $${params.length}`)
      }

      params.push(templateId)
      const rows = await sqlRows<TemplateRow[]>(
        qr,
        `UPDATE message_templates SET ${sets.join(', ')} WHERE id = $${params.length} AND is_active = true RETURNING *`,
        params,
      )
      return rows[0] ?? null
    })
  }

  async softDelete(schemaName: string, templateId: string): Promise<number> {
    return this.db.query(schemaName, async (qr): Promise<number> => {
      const rows = await sqlRows<TemplateRow[]>(
        qr,
        `UPDATE message_templates SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id`,
        [templateId],
      )
      return rows.length
    })
  }
}
