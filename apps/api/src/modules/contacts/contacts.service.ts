import { Injectable, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  Contact,
  ContactListItem,
  PaginatedContacts,
  ContactTimeline,
  ContactActivity,
  ContactDeal,
} from '@repo/shared-types'
import type { CreateContactDto, UpdateContactDto, ContactQueryDto } from './dto/contact.dto'

// ─── Field mapping: DTO key → SQL column name ─────────────────────────────────

const UPDATABLE_FIELDS: Array<[keyof UpdateContactDto, string]> = [
  ['firstName', 'first_name'],
  ['lastName', 'last_name'],
  ['email', 'email'],
  ['phone', 'phone'],
  ['whatsapp', 'whatsapp'],
  ['documentType', 'document_type'],
  ['documentNumber', 'document_number'],
  ['city', 'city'],
  ['department', 'department'],
  ['municipioCode', 'municipio_code'],
  ['status', 'status'],
  ['source', 'source'],
  ['leadScore', 'lead_score'],
  ['tags', 'tags'],
  ['companyId', 'company_id'],
  ['assignedToId', 'assigned_to_id'],
  ['customFields', 'custom_fields'],
]

// ─── DB row shapes ────────────────────────────────────────────────────────────

interface ContactRow {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  document_type: string | null
  document_number: string | null
  city: string | null
  department: string | null
  municipio_code: string | null
  status: string
  source: string | null
  lead_score: number
  tags: string[]
  company_id: string | null
  assigned_to_id: string | null
  custom_fields?: Record<string, unknown>
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

interface ActivityRow {
  id: string
  activity_type: string
  title: string | null
  description: string | null
  due_date: string | null
  completed_at: string | null
  assigned_to_id: string | null
  created_by: string | null
  created_at: string
}

interface DealRow {
  id: string
  title: string
  value_cents: number
  status: string
  stage_id: string | null
  pipeline_id: string | null
  expected_close_date: string | null
  created_at: string
}

// SQL column list shared between findOne, create RETURNING and update RETURNING
const CONTACT_COLUMNS = `
  id, first_name, last_name, email, phone, whatsapp,
  document_type, document_number, city, department, municipio_code,
  status, source, lead_score, tags, company_id, assigned_to_id,
  custom_fields, is_active, created_by, created_at, updated_at
`

// SQL column list for list view (excludes custom_fields for performance)
const CONTACT_LIST_COLUMNS = `
  id, first_name, last_name, email, phone, whatsapp,
  document_type, document_number, city, department, municipio_code,
  status, source, lead_score, tags, company_id, assigned_to_id,
  is_active, created_by, created_at, updated_at
`

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class ContactsService {
  constructor(private readonly db: TenantDbService) {}

  // ─── List ─────────────────────────────────────────────────────────────────

  async findAll(schemaName: string, query: ContactQueryDto): Promise<PaginatedContacts> {
    return this.db.query(schemaName, async (qr): Promise<PaginatedContacts> => {
      const page = query.page ?? 1
      const limit = query.limit ?? 25
      const offset = (page - 1) * limit

      const { where, params } = this.buildWhereClause(query)

      const countRows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count FROM contacts WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const dataParams = [...params, limit, offset]
      const rows: ContactRow[] = await qr.query(
        `SELECT ${CONTACT_LIST_COLUMNS}
         FROM contacts
         WHERE ${where}
         ORDER BY created_at DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { data: rows.map((r) => this.mapListItem(r)), total, page, limit }
    })
  }

  // ─── Find one ─────────────────────────────────────────────────────────────

  async findOne(schemaName: string, contactId: string): Promise<Contact> {
    return this.db.query(schemaName, async (qr): Promise<Contact> => {
      return this.fetchContactOrFail(qr, contactId)
    })
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(schemaName: string, dto: CreateContactDto, createdById: string): Promise<Contact> {
    return this.db.query(schemaName, async (qr): Promise<Contact> => {
      const rows: ContactRow[] = await qr.query(
        `INSERT INTO contacts (
           first_name, last_name, email, phone, whatsapp,
           document_type, document_number, city, department, municipio_code,
           status, source, lead_score, tags, company_id, assigned_to_id,
           custom_fields, created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         RETURNING ${CONTACT_COLUMNS}`,
        [
          dto.firstName,
          dto.lastName ?? null,
          dto.email ?? null,
          dto.phone ?? null,
          dto.whatsapp ?? null,
          dto.documentType ?? null,
          dto.documentNumber ?? null,
          dto.city ?? null,
          dto.department ?? null,
          dto.municipioCode ?? null,
          dto.status ?? 'new',
          dto.source ?? null,
          dto.leadScore ?? 0,
          dto.tags ?? [],
          dto.companyId ?? null,
          dto.assignedToId ?? null,
          dto.customFields ?? {},
          createdById,
        ],
      )
      const row = rows[0]
      if (!row) throw new Error('Contact insert returned no row')
      return this.mapContact(row)
    })
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(schemaName: string, contactId: string, dto: UpdateContactDto): Promise<Contact> {
    return this.db.transactional(schemaName, async (qr): Promise<Contact> => {
      await this.assertContactExists(qr, contactId)

      const updates: string[] = []
      const values: unknown[] = []

      for (const [dtoKey, col] of UPDATABLE_FIELDS) {
        if (dto[dtoKey] !== undefined) {
          values.push(dto[dtoKey])
          updates.push(`${col} = $${values.length}`)
        }
      }

      if (!updates.length) return this.fetchContactOrFail(qr, contactId)

      values.push(contactId)
      const rows: ContactRow[] = await qr.query(
        `UPDATE contacts
         SET ${updates.join(', ')}, updated_at = NOW()
         WHERE id = $${values.length}
         RETURNING ${CONTACT_COLUMNS}`,
        values,
      )
      return this.mapContact(rows[0]!)
    })
  }

  // ─── Remove (soft delete) ─────────────────────────────────────────────────

  async remove(schemaName: string, contactId: string): Promise<void> {
    await this.db.transactional(schemaName, async (qr): Promise<void> => {
      await this.assertContactExists(qr, contactId)
      await qr.query(`UPDATE contacts SET is_active = false, updated_at = NOW() WHERE id = $1`, [
        contactId,
      ])
    })
  }

  // ─── Timeline ─────────────────────────────────────────────────────────────

  async getTimeline(schemaName: string, contactId: string): Promise<ContactTimeline> {
    return this.db.query(schemaName, async (qr): Promise<ContactTimeline> => {
      await this.assertContactExists(qr, contactId)

      // Fetch activities and deals in parallel — independent queries
      const [activityRows, dealRows] = await Promise.all([
        qr.query(
          `SELECT id, activity_type, title, description, due_date, completed_at,
                  assigned_to_id, created_by, created_at
           FROM activities
           WHERE contact_id = $1
           ORDER BY created_at DESC
           LIMIT 50`,
          [contactId],
        ) as Promise<ActivityRow[]>,
        qr.query(
          `SELECT id, title, value_cents, status, stage_id, pipeline_id,
                  expected_close_date, created_at
           FROM deals
           WHERE contact_id = $1 AND is_active = true
           ORDER BY created_at DESC`,
          [contactId],
        ) as Promise<DealRow[]>,
      ])

      return {
        activities: activityRows.map((a) => this.mapActivity(a)),
        deals: dealRows.map((d) => this.mapDeal(d)),
      }
    })
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Throws NotFoundException if the contact does not exist or is soft-deleted.
   * Reused by update, remove and getTimeline to avoid duplicate queries.
   */
  private async assertContactExists(qr: QueryRunner, contactId: string): Promise<void> {
    const rows: [{ id: string }?] = await qr.query(
      `SELECT id FROM contacts WHERE id = $1 AND is_active = true`,
      [contactId],
    )
    if (!rows[0]) throw new NotFoundException(`Contact ${contactId} not found`)
  }

  /**
   * Fetches a full contact row within an existing QueryRunner.
   * Used by update (read-after-write on the same connection) and findOne.
   */
  private async fetchContactOrFail(qr: QueryRunner, contactId: string): Promise<Contact> {
    const rows: ContactRow[] = await qr.query(
      `SELECT ${CONTACT_COLUMNS} FROM contacts WHERE id = $1 AND is_active = true`,
      [contactId],
    )
    const row = rows[0]
    if (!row) throw new NotFoundException(`Contact ${contactId} not found`)
    return this.mapContact(row)
  }

  /**
   * Builds the parameterized WHERE clause from ContactQueryDto filters.
   * Returns the clause string and the bound params array.
   */
  private buildWhereClause(query: ContactQueryDto): { where: string; params: unknown[] } {
    const conditions: string[] = ['is_active = true']
    const params: unknown[] = []

    const push = (condition: string, value: unknown) => {
      params.push(value)
      conditions.push(condition.replace('?', `$${params.length}`))
    }

    if (query.q) {
      push(
        `to_tsvector('spanish',
          coalesce(first_name, '') || ' ' ||
          coalesce(last_name, '') || ' ' ||
          coalesce(email, '') || ' ' ||
          coalesce(document_number, '') || ' ' ||
          coalesce(phone, '')
        ) @@ plainto_tsquery('spanish', ?)`,
        query.q,
      )
    }
    if (query.status) push(`status = ?`, query.status)
    if (query.source) push(`source = ?`, query.source)
    if (query.tags?.length) push(`tags @> ?::text[]`, query.tags)
    if (query.companyId) push(`company_id = ?`, query.companyId)
    if (query.assignedToId) push(`assigned_to_id = ?`, query.assignedToId)

    return { where: conditions.join(' AND '), params }
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  private mapListItem(r: ContactRow): ContactListItem {
    return {
      id: r.id,
      firstName: r.first_name,
      lastName: r.last_name,
      email: r.email,
      phone: r.phone,
      whatsapp: r.whatsapp,
      documentType: r.document_type as ContactListItem['documentType'],
      documentNumber: r.document_number,
      city: r.city,
      department: r.department,
      municipioCode: r.municipio_code,
      status: r.status as ContactListItem['status'],
      source: r.source as ContactListItem['source'],
      leadScore: r.lead_score,
      tags: r.tags,
      companyId: r.company_id,
      assignedToId: r.assigned_to_id,
      isActive: r.is_active,
      createdById: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }

  private mapContact(r: ContactRow): Contact {
    return {
      ...this.mapListItem(r),
      customFields: r.custom_fields ?? {},
    }
  }

  private mapActivity(a: ActivityRow): ContactActivity {
    return {
      id: a.id,
      activityType: a.activity_type,
      title: a.title,
      description: a.description,
      dueDate: a.due_date,
      completedAt: a.completed_at,
      assignedToId: a.assigned_to_id,
      createdById: a.created_by,
      createdAt: a.created_at,
    }
  }

  private mapDeal(d: DealRow): ContactDeal {
    return {
      id: d.id,
      title: d.title,
      valueCents: d.value_cents,
      status: d.status,
      stageId: d.stage_id,
      pipelineId: d.pipeline_id,
      expectedCloseDate: d.expected_close_date,
      createdAt: d.created_at,
    }
  }
}
