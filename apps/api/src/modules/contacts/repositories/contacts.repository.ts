import { Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { CONTACT_UNASSIGNED_RECENT_DAYS } from '@repo/shared-types'
import { DEFAULT_PAGE_SIZE } from '@repo/shared-utils'
import type { ContactMergeField } from '@repo/shared-types'
import type {
  ActivityRow,
  ContactColumnChange,
  ContactListQuery,
  ContactPage,
  ContactRow,
  ContactStatusCountRow,
  CreateContactData,
  DealRow,
  MergeMovedRows,
  TaxonomyUsageCountRow,
} from '../interfaces/contact-row.interfaces'
import {
  CONTACT_COLUMNS,
  CONTACT_INSERT_COLUMNS,
  CONTACT_LIST_COLUMNS,
  MERGE_CHILD_TABLES,
  MERGE_CUSTOM_FIELDS_SQL,
  MERGE_FIELD_COLUMNS,
  MERGE_TAGS_SQL,
  WINNER_CONTACT_COLUMNS,
  REASSIGN_TAXONOMY_SQL,
  SORTABLE_COLUMNS,
  TAXONOMY_USAGE_SQL,
  type TaxonomyColumn,
} from '../constants/contact.constants'
import { buildContactWhereClause } from '@/shared/database/contact-filter-sql'
import { sqlRows } from '@/shared/database/sql.util'

function insertValues(data: CreateContactData): unknown[] {
  return [
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
  ]
}

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
      const orderBy = this.buildOrderClause(query)
      const rows = await sqlRows<ContactRow[]>(
        qr,
        `SELECT ${CONTACT_LIST_COLUMNS}
         FROM contacts
         JOIN (
           SELECT id FROM contacts
           WHERE ${where}
           ${orderBy}
           LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
         ) AS page USING (id)
         ${orderBy}`,
        dataParams,
      )

      return { rows, total, page, limit }
    })
  }

  async lockByIds(qr: QueryRunner, contactIds: ReadonlyArray<string>): Promise<ContactRow[]> {
    return sqlRows<ContactRow[]>(
      qr,
      `SELECT ${CONTACT_COLUMNS} FROM contacts
       WHERE id = ANY($1::uuid[])
       ORDER BY id
       FOR UPDATE`,
      [contactIds],
    )
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
        `SELECT COUNT(*)::text AS count
         FROM contacts
         WHERE is_active = false AND merged_into_id IS NULL`,
      )
      return Number.parseInt(rows[0].count, 10)
    })
  }

  async restoreById(qr: QueryRunner, contactId: string): Promise<ContactRow | null> {
    const rows = await sqlRows<ContactRow[]>(
      qr,
      `UPDATE contacts SET is_active = true, updated_at = NOW()
       WHERE id = $1 AND is_active = false AND merged_into_id IS NULL
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

      const statuses = await grouped('status')
      const sources = await grouped('source')
      const lifecycleStages = await grouped('lifecycle')
      const tags = await sqlRows<TaxonomyUsageCountRow[]>(
        qr,
        `SELECT tag AS key, COUNT(*)::text AS count
         FROM contacts, unnest(tags) AS tag
         WHERE is_active = true
         GROUP BY tag`,
      )

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

  async findDetailById(qr: QueryRunner, contactId: string): Promise<ContactRow | null> {
    const rows = await sqlRows<ContactRow[]>(
      qr,
      `SELECT ${CONTACT_LIST_COLUMNS} FROM contacts WHERE id = $1 AND is_active = true`,
      [contactId],
    )
    return rows[0] ?? null
  }

  async findActiveById(
    qr: QueryRunner,
    contactId: string,
    options: { forUpdate?: boolean } = {},
  ): Promise<ContactRow | null> {
    const rows = await sqlRows<ContactRow[]>(
      qr,
      `SELECT ${CONTACT_COLUMNS} FROM contacts
       WHERE id = $1 AND is_active = true ${this.lockClause(options)}`,
      [contactId],
    )
    return rows[0] ?? null
  }

  private lockClause(options: { forUpdate?: boolean }): string {
    return options.forUpdate ? 'FOR UPDATE' : ''
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
    const rows = await this.insertMany(qr, [data])
    return rows[0] ?? null
  }

  async insertMany(
    qr: QueryRunner,
    contacts: ReadonlyArray<CreateContactData>,
  ): Promise<ContactRow[]> {
    if (contacts.length === 0) return []
    const width = CONTACT_INSERT_COLUMNS.length
    const values = contacts.map(
      (_, row) =>
        `(${Array.from({ length: width }, (__, col) => `$${row * width + col + 1}`).join(',')})`,
    )
    return sqlRows<ContactRow[]>(
      qr,
      `INSERT INTO contacts (${CONTACT_INSERT_COLUMNS.join(', ')})
       VALUES ${values.join(', ')}
       RETURNING ${CONTACT_COLUMNS}`,
      contacts.flatMap((data) => insertValues(data)),
    )
  }

  async findImportMatches(
    qr: QueryRunner,
    contacts: ReadonlyArray<CreateContactData>,
  ): Promise<Map<string, string>> {
    const emails = contacts.flatMap((data) => (data.email ? [data.email.toLowerCase()] : []))
    const documents = contacts.flatMap((data) => (data.documentNumber ? [data.documentNumber] : []))
    const phones = contacts.flatMap((data) => (data.phone ? [data.phone] : []))
    const matches = new Map<string, string>()
    if (emails.length === 0 && documents.length === 0 && phones.length === 0) return matches

    const rows = await sqlRows<
      Array<{
        id: string
        email: string | null
        document_number: string | null
        phone: string | null
        whatsapp: string | null
      }>
    >(
      qr,
      `SELECT id, email, document_number, phone, whatsapp FROM contacts
       WHERE is_active = true
         AND (LOWER(email) = ANY($1::text[])
           OR document_number = ANY($2::text[])
           OR phone = ANY($3::text[])
           OR whatsapp = ANY($3::text[]))`,
      [emails, documents, phones],
    )
    for (const row of rows) {
      if (row.email) matches.set(`email:${row.email.toLowerCase()}`, row.id)
      if (row.document_number) matches.set(`document:${row.document_number}`, row.id)
      if (row.phone) matches.set(`phone:${row.phone}`, row.id)
      if (row.whatsapp) matches.set(`phone:${row.whatsapp}`, row.id)
    }
    return matches
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
       WHERE id = $${values.length} AND is_active = true
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
      `SELECT name FROM tags WHERE entity_type = 'contact' AND enabled = true AND deleted_at IS NULL`,
      [],
    )
    return rows.map((row) => row.name)
  }

  async findActivities(qr: QueryRunner, contactId: string, limit: number): Promise<ActivityRow[]> {
    const rows = await sqlRows<ActivityRow[]>(
      qr,
      `SELECT id, activity_type, title, description, due_date, completed_at,
              status, priority, duration_minutes, assigned_to_id, created_by, created_at
       FROM activities
       WHERE contact_id = $1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT $2`,
      [contactId, limit],
    )
    return rows
  }

  async findDeals(qr: QueryRunner, contactId: string, limit: number): Promise<DealRow[]> {
    const rows = await sqlRows<DealRow[]>(
      qr,
      `SELECT id, title, value_cents, status, stage_id, pipeline_id,
              expected_close_date, created_at
       FROM deals
       WHERE contact_id = $1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT $2`,
      [contactId, limit],
    )
    return rows
  }

  async moveChildRows(qr: QueryRunner, loserId: string, winnerId: string): Promise<MergeMovedRows> {
    const moved: Record<string, number> = {}
    for (const table of MERGE_CHILD_TABLES) {
      const rows = await sqlRows<Array<{ id: string }>>(
        qr,
        `UPDATE ${table} SET contact_id = $2 WHERE contact_id = $1 RETURNING id`,
        [loserId, winnerId],
      )
      moved[table] = rows.length
    }
    return moved
  }

  async moveMissingConsents(qr: QueryRunner, loserId: string, winnerId: string): Promise<number> {
    const rows = await sqlRows<Array<{ id: string }>>(
      qr,
      `UPDATE data_consents AS loser
       SET contact_id = $2, updated_at = NOW()
       WHERE loser.contact_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM data_consents AS winner
           WHERE winner.contact_id = $2 AND winner.channel = loser.channel
         )
       RETURNING loser.id`,
      [loserId, winnerId],
    )
    return rows.length
  }

  async dropRemainingConsents(qr: QueryRunner, loserId: string): Promise<void> {
    await qr.query(`DELETE FROM data_consents WHERE contact_id = $1`, [loserId])
  }

  async applyMergedFields(
    qr: QueryRunner,
    winnerId: string,
    loserId: string,
    fields: ReadonlyArray<ContactMergeField>,
  ): Promise<ContactRow | null> {
    const taken = fields.map((field) => {
      const column = MERGE_FIELD_COLUMNS[field]
      return `${column} = loser.${column}`
    })
    const assignments = [...taken, MERGE_TAGS_SQL, MERGE_CUSTOM_FIELDS_SQL, 'updated_at = NOW()']

    const rows = await sqlRows<ContactRow[]>(
      qr,
      `UPDATE contacts AS winner
       SET ${assignments.join(', ')}
       FROM contacts AS loser
       WHERE winner.id = $1 AND loser.id = $2
       RETURNING ${WINNER_CONTACT_COLUMNS}`,
      [winnerId, loserId],
    )
    return rows[0] ?? null
  }

  async markMergedInto(qr: QueryRunner, loserId: string, winnerId: string): Promise<void> {
    await qr.query(
      `UPDATE contacts
       SET is_active = false, merged_into_id = $2, updated_at = NOW()
       WHERE id = $1`,
      [loserId, winnerId],
    )
  }

  private buildOrderClause(query: ContactListQuery): string {
    const column = query.sortBy ? SORTABLE_COLUMNS[query.sortBy] : 'created_at'
    const direction = query.sortDir === 'asc' ? 'ASC' : 'DESC'
    return `ORDER BY ${column} ${direction} NULLS LAST, id ASC`
  }
}
