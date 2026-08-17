import { Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { DEFAULT_PAGE_SIZE } from '@repo/shared-utils'
import type {
  ActivityRow,
  ContactColumnChange,
  ContactListQuery,
  ContactPage,
  ContactRow,
  ContactStatusCountRow,
  CreateContactData,
  DealRow,
  TaxonomyUsageCountRow,
} from '../interfaces/contact-row.interfaces'
import {
  CONTACT_COLUMNS,
  CONTACT_LIST_COLUMNS,
  REASSIGN_TAXONOMY_SQL,
  SORTABLE_COLUMNS,
  TAXONOMY_USAGE_SQL,
  type TaxonomyColumn,
} from '../constants/contact.constants'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class ContactsRepository {
  constructor(private readonly db: TenantDbService) {}

  async findPage(schemaName: string, query: ContactListQuery): Promise<ContactPage> {
    return this.db.query(schemaName, async (qr): Promise<ContactPage> => {
      const page = query.page ?? 1
      const limit = query.limit ?? DEFAULT_PAGE_SIZE
      const offset = (page - 1) * limit

      const { where, params } = this.buildWhereClause(query)

      const countRows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM contacts WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const dataParams = [...params, limit, offset]
      const rows = await sqlRows<ContactRow[]>(
        qr,
        `SELECT ${CONTACT_LIST_COLUMNS}
         FROM contacts
         WHERE ${where}
         ${this.buildOrderClause(query)}
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { rows, total, page, limit }
    })
  }

  async countByStatus(schemaName: string): Promise<ContactStatusCountRow[]> {
    return this.db.query(schemaName, async (qr): Promise<ContactStatusCountRow[]> => {
      const rows = await sqlRows<ContactStatusCountRow[]>(
        qr,
        `SELECT status, COUNT(*)::text AS count
         FROM contacts
         WHERE is_active = true
         GROUP BY status`,
      )
      return rows
    })
  }

  async taxonomyUsage(schemaName: string): Promise<{
    statuses: TaxonomyUsageCountRow[]
    sources: TaxonomyUsageCountRow[]
    types: TaxonomyUsageCountRow[]
    tags: TaxonomyUsageCountRow[]
  }> {
    return this.db.query(schemaName, async (qr) => {
      const grouped = (column: TaxonomyColumn) =>
        sqlRows<TaxonomyUsageCountRow[]>(qr, TAXONOMY_USAGE_SQL[column])

      const [statuses, sources, types, tags] = await Promise.all([
        grouped('status'),
        grouped('source'),
        grouped('type'),
        sqlRows<TaxonomyUsageCountRow[]>(
          qr,
          `SELECT tag AS key, COUNT(*)::text AS count
           FROM contacts, unnest(tags) AS tag
           WHERE is_active = true
           GROUP BY tag`,
        ),
      ])

      return { statuses, sources, types, tags }
    })
  }

  async reassignTaxonomyColumn(
    schemaName: string,
    column: TaxonomyColumn,
    fromKey: string,
    toKey: string,
  ): Promise<number> {
    return this.db.query(schemaName, async (qr) => {
      const rows = await sqlRows<Array<{ id: string }>>(qr, REASSIGN_TAXONOMY_SQL[column], [
        fromKey,
        toKey,
      ])
      return rows.length
    })
  }

  async reassignTag(schemaName: string, fromName: string, toName: string): Promise<number> {
    return this.db.query(schemaName, async (qr) => {
      const rows = await sqlRows<Array<{ id: string }>>(
        qr,
        `UPDATE contacts
         SET tags = ARRAY(SELECT DISTINCT t FROM unnest(array_replace(tags, $1, $2)) AS t),
             updated_at = NOW()
         WHERE $1 = ANY(tags)
         RETURNING id`,
        [fromName, toName],
      )
      return rows.length
    })
  }

  async findActiveById(qr: QueryRunner, contactId: string): Promise<ContactRow | null> {
    const rows = await sqlRows<ContactRow[]>(
      qr,
      `SELECT ${CONTACT_COLUMNS} FROM contacts WHERE id = $1 AND is_active = true`,
      [contactId],
    )
    return rows[0] ?? null
  }

  async existsActiveById(qr: QueryRunner, contactId: string): Promise<boolean> {
    const rows = await sqlRows<[{ id: string }?]>(
      qr,
      `SELECT id FROM contacts WHERE id = $1 AND is_active = true`,
      [contactId],
    )
    return Boolean(rows[0])
  }

  async insert(qr: QueryRunner, data: CreateContactData): Promise<ContactRow | null> {
    const rows = await sqlRows<ContactRow[]>(
      qr,
      `INSERT INTO contacts (
         first_name, last_name, email, phone, whatsapp,
         document_type, document_number, job_title, linkedin_url, birthday,
         address, city, department, municipio_code,
         status, lifecycle_stage, source, lead_score,
         data_consent, consent_date, consent_source,
         opt_out_email, opt_out_sms, opt_out_whatsapp,
         tags, company_id, assigned_to_id, custom_fields, created_by,
         type, type_label, avatar_url
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32)
       RETURNING ${CONTACT_COLUMNS}`,
      [
        data.firstName,
        data.lastName,
        data.email,
        data.phone,
        data.whatsapp,
        data.documentType,
        data.documentNumber,
        data.jobTitle,
        data.linkedinUrl,
        data.birthday,
        data.address,
        data.city,
        data.department,
        data.municipioCode,
        data.status,
        data.lifecycleStage,
        data.source,
        data.leadScore,
        data.dataConsent,
        data.consentDate,
        data.consentSource,
        data.optOutEmail,
        data.optOutSms,
        data.optOutWhatsapp,
        data.tags,
        data.companyId,
        data.assignedToId,
        data.customFields,
        data.createdBy,
        data.type,
        data.typeLabel,
        data.avatarUrl,
      ],
    )
    return rows[0] ?? null
  }

  async updateById(
    qr: QueryRunner,
    contactId: string,
    changes: ContactColumnChange[],
  ): Promise<ContactRow | null> {
    const values: unknown[] = changes.map((change) => change.value)
    const updates = changes.map((change, index) => `${change.column} = $${index + 1}`)

    updates.push('updated_at = NOW()')
    if (changes.some((change) => change.column === 'status')) {
      updates.push('status_changed_at = NOW()')
    }

    values.push(contactId)
    const rows = await sqlRows<ContactRow[]>(
      qr,
      `UPDATE contacts
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING ${CONTACT_COLUMNS}`,
      values,
    )
    return rows[0] ?? null
  }

  async softDeleteById(qr: QueryRunner, contactId: string): Promise<void> {
    await qr.query(`UPDATE contacts SET is_active = false, updated_at = NOW() WHERE id = $1`, [
      contactId,
    ])
  }

  async findEnabledTagNames(qr: QueryRunner): Promise<string[]> {
    const rows = await sqlRows<Array<{ name: string }>>(
      qr,
      `SELECT name FROM tags WHERE entity_type = 'contact' AND enabled = true`,
      [],
    )
    return rows.map((row) => row.name)
  }

  async findActivities(qr: QueryRunner, contactId: string): Promise<ActivityRow[]> {
    const rows = await sqlRows<ActivityRow[]>(
      qr,
      `SELECT id, activity_type, title, description, due_date, completed_at,
              assigned_to_id, created_by, created_at
       FROM activities
       WHERE contact_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [contactId],
    )
    return rows
  }

  async findDeals(qr: QueryRunner, contactId: string): Promise<DealRow[]> {
    const rows = await sqlRows<DealRow[]>(
      qr,
      `SELECT id, title, value_cents, status, stage_id, pipeline_id,
              expected_close_date, created_at
       FROM deals
       WHERE contact_id = $1 AND is_active = true
       ORDER BY created_at DESC`,
      [contactId],
    )
    return rows
  }

  private buildWhereClause(query: ContactListQuery): { where: string; params: unknown[] } {
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
    if (query.lifecycleStage) push(`lifecycle_stage = ?`, query.lifecycleStage)
    if (query.tags?.length) push(`tags @> ?::text[]`, query.tags)
    if (query.companyId) push(`company_id = ?`, query.companyId)
    if (query.assignedToId) push(`assigned_to_id = ?`, query.assignedToId)
    if (query.city) push(`LOWER(city) = LOWER(?)`, query.city)
    if (query.createdFrom) push(`created_at >= ?`, query.createdFrom)
    if (query.createdTo) push(`created_at <= ?`, query.createdTo)
    if (query.lastContactedFrom) push(`last_contacted_at >= ?`, query.lastContactedFrom)
    if (query.lastContactedTo) push(`last_contacted_at <= ?`, query.lastContactedTo)

    return { where: conditions.join(' AND '), params }
  }

  private buildOrderClause(query: ContactListQuery): string {
    const column = query.sortBy ? SORTABLE_COLUMNS[query.sortBy] : 'created_at'
    const direction = query.sortDir === 'asc' ? 'ASC' : 'DESC'
    return `ORDER BY ${column} ${direction} NULLS LAST, id ASC`
  }
}
