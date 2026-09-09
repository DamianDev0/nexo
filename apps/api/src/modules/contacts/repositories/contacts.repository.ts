import { Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { CONTACT_UNASSIGNED_RECENT_DAYS } from '@repo/shared-types'
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
import { buildContactWhereClause } from '@/shared/database/contact-filter-sql'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class ContactsRepository {
  constructor(private readonly db: TenantDbService) {}

  async findPage(schemaName: string, query: ContactListQuery): Promise<ContactPage> {
    return this.db.query(schemaName, async (qr): Promise<ContactPage> => {
      const page = query.page ?? 1
      const limit = query.limit ?? DEFAULT_PAGE_SIZE
      const offset = (page - 1) * limit

      const { where, params } = buildContactWhereClause(query)

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

  async countOwnership(
    schemaName: string,
    userId: string,
  ): Promise<{ mine: number; unassigned: number; unassignedRecent: number }> {
    return this.db.query(schemaName, async (qr) => {
      const rows = await sqlRows<[{ mine: string; unassigned: string; unassigned_recent: string }]>(
        qr,
        `SELECT
           COUNT(*) FILTER (WHERE assigned_to_id = $1)::text AS mine,
           COUNT(*) FILTER (WHERE assigned_to_id IS NULL)::text AS unassigned,
           COUNT(*) FILTER (
             WHERE assigned_to_id IS NULL
               AND created_at >= NOW() - make_interval(days => $2)
           )::text AS unassigned_recent
         FROM contacts WHERE is_active = true`,
        [userId, CONTACT_UNASSIGNED_RECENT_DAYS],
      )
      return {
        mine: Number.parseInt(rows[0].mine, 10),
        unassigned: Number.parseInt(rows[0].unassigned, 10),
        unassignedRecent: Number.parseInt(rows[0].unassigned_recent, 10),
      }
    })
  }

  async countArchived(schemaName: string): Promise<number> {
    return this.db.query(schemaName, async (qr): Promise<number> => {
      const rows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM contacts WHERE is_active = false`,
      )
      return Number.parseInt(rows[0].count, 10)
    })
  }

  async restoreById(qr: QueryRunner, contactId: string): Promise<ContactRow | null> {
    const rows = await sqlRows<ContactRow[]>(
      qr,
      `UPDATE contacts SET is_active = true, updated_at = NOW()
       WHERE id = $1 AND is_active = false
       RETURNING ${CONTACT_COLUMNS}`,
      [contactId],
    )
    return rows[0] ?? null
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
    lifecycleStages: TaxonomyUsageCountRow[]
    tags: TaxonomyUsageCountRow[]
  }> {
    return this.db.query(schemaName, async (qr) => {
      const grouped = (column: TaxonomyColumn) =>
        sqlRows<TaxonomyUsageCountRow[]>(qr, TAXONOMY_USAGE_SQL[column])

      const [statuses, sources, lifecycleStages, tags] = await Promise.all([
        grouped('status'),
        grouped('source'),
        grouped('lifecycle'),
        sqlRows<TaxonomyUsageCountRow[]>(
          qr,
          `SELECT tag AS key, COUNT(*)::text AS count
           FROM contacts, unnest(tags) AS tag
           WHERE is_active = true
           GROUP BY tag`,
        ),
      ])

      return { statuses, sources, lifecycleStages, tags }
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

  async recordLifecycleChange(
    qr: QueryRunner,
    contactId: string,
    fromStage: string | null,
    toStage: string,
    changedBy: string | null,
  ): Promise<void> {
    await sqlRows(
      qr,
      `INSERT INTO contact_lifecycle_history (contact_id, from_stage, to_stage, source, changed_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [contactId, fromStage, toStage, 'manual', changedBy],
    )
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
         document_type, document_number, avatar_url, city, municipio_code,
         status, lifecycle_stage, source,
         tags, company_id, assigned_to_id, custom_fields, created_by
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING ${CONTACT_COLUMNS}`,
      [
        data.firstName,
        data.lastName,
        data.email,
        data.phone,
        data.whatsapp,
        data.documentType,
        data.documentNumber,
        data.avatarUrl,
        data.city,
        data.municipioCode,
        data.status,
        data.lifecycleStage,
        data.source,
        data.tags,
        data.companyId,
        data.assignedToId,
        data.customFields,
        data.createdBy,
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
    const updates = changes.map((change, index) =>
      change.column === 'custom_fields'
        ? `custom_fields = jsonb_strip_nulls(COALESCE(custom_fields, '{}'::jsonb) || $${index + 1}::jsonb)`
        : `${change.column} = $${index + 1}`,
    )

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

  async findImportMatchId(
    qr: QueryRunner,
    email: string | null,
    documentNumber: string | null,
  ): Promise<string | null> {
    if (!email && !documentNumber) return null

    const rows = await sqlRows<Array<{ id: string }>>(
      qr,
      `SELECT id FROM contacts
       WHERE is_active = true
         AND (($1::text IS NOT NULL AND LOWER(email) = LOWER($1))
           OR ($2::text IS NOT NULL AND document_number = $2))
       LIMIT 1`,
      [email, documentNumber],
    )
    return rows[0]?.id ?? null
  }

  async findEnabledTagNames(qr: QueryRunner): Promise<string[]> {
    const rows = await sqlRows<Array<{ name: string }>>(
      qr,
      `SELECT name FROM tags WHERE entity_type = 'contact' AND enabled = true AND deleted_at IS NULL`,
      [],
    )
    return rows.map((row) => row.name)
  }

  async findActivities(qr: QueryRunner, contactId: string): Promise<ActivityRow[]> {
    const rows = await sqlRows<ActivityRow[]>(
      qr,
      `SELECT id, activity_type, title, description, due_date, completed_at,
              status, priority, assigned_to_id, created_by, created_at
       FROM activities
       WHERE contact_id = $1 AND is_active = true
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

  private buildOrderClause(query: ContactListQuery): string {
    const column = query.sortBy ? SORTABLE_COLUMNS[query.sortBy] : 'created_at'
    const direction = query.sortDir === 'asc' ? 'ASC' : 'DESC'
    return `ORDER BY ${column} ${direction} NULLS LAST, id ASC`
  }
}
