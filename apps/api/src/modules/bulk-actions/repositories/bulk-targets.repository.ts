import { Injectable } from '@nestjs/common'
import type { CustomFieldEntity } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import {
  buildContactWhereClause,
  type ContactFilterQuery,
} from '@/shared/database/contact-filter-sql'
import { sqlRows } from '@/shared/database/sql.util'
import { BULK_CONTACT_FIELD_SQL, BULK_TABLES } from '../constants/bulk-action.constants'
import {
  SNAPSHOT_COLUMNS,
  type BulkMessageTemplateRow,
  type BulkRecipientRow,
  type BulkSnapshotRow,
  type SnapshotBefore,
  type SnapshotSpec,
} from '../interfaces/bulk-action-row.interfaces'

type IdRow = { id: string }

@Injectable()
export class BulkTargetsRepository {
  constructor(private readonly db: TenantDbService) {}

  async resolveContactIds(
    schemaName: string,
    query: ContactFilterQuery,
    limit: number,
  ): Promise<string[]> {
    return this.db.query(schemaName, async (qr) => {
      const { where, params } = buildContactWhereClause(query)
      const rows = await sqlRows<IdRow[]>(
        qr,
        `SELECT id FROM contacts WHERE ${where} ORDER BY created_at ASC, id ASC LIMIT $${params.length + 1}`,
        [...params, limit + 1],
      )
      return rows.map((row) => row.id)
    })
  }

  async addTags(
    schemaName: string,
    entity: CustomFieldEntity,
    ids: string[],
    tags: string[],
  ): Promise<string[]> {
    const TABLE = BULK_TABLES[entity]
    return this.updateReturningIds(
      schemaName,
      `UPDATE ${TABLE}
       SET tags = ARRAY(SELECT DISTINCT t FROM unnest(array_cat(tags, $2::text[])) AS t ORDER BY t),
           updated_at = NOW()
       WHERE id = ANY($1::uuid[]) AND is_active = true
       RETURNING id`,
      [ids, tags],
    )
  }

  async removeTags(
    schemaName: string,
    entity: CustomFieldEntity,
    ids: string[],
    tags: string[],
  ): Promise<string[]> {
    const TABLE = BULK_TABLES[entity]
    return this.updateReturningIds(
      schemaName,
      `UPDATE ${TABLE}
       SET tags = ARRAY(SELECT unnest(tags) EXCEPT SELECT unnest($2::text[])),
           updated_at = NOW()
       WHERE id = ANY($1::uuid[]) AND is_active = true
       RETURNING id`,
      [ids, tags],
    )
  }

  async assign(
    schemaName: string,
    entity: CustomFieldEntity,
    ids: string[],
    assignedToId: string,
  ): Promise<string[]> {
    const TABLE = BULK_TABLES[entity]
    return this.updateReturningIds(
      schemaName,
      `UPDATE ${TABLE}
       SET assigned_to_id = $2, updated_at = NOW()
       WHERE id = ANY($1::uuid[]) AND is_active = true
       RETURNING id`,
      [ids, assignedToId],
    )
  }

  async archive(schemaName: string, entity: CustomFieldEntity, ids: string[]): Promise<string[]> {
    const TABLE = BULK_TABLES[entity]
    return this.updateReturningIds(
      schemaName,
      `UPDATE ${TABLE}
       SET is_active = false, updated_at = NOW()
       WHERE id = ANY($1::uuid[]) AND is_active = true
       RETURNING id`,
      [ids],
    )
  }

  async restore(schemaName: string, entity: CustomFieldEntity, ids: string[]): Promise<string[]> {
    const TABLE = BULK_TABLES[entity]
    return this.updateReturningIds(
      schemaName,
      `UPDATE ${TABLE}
       SET is_active = true, updated_at = NOW()
       WHERE id = ANY($1::uuid[]) AND is_active = false
       RETURNING id`,
      [ids],
    )
  }

  async updateContactColumn(
    schemaName: string,
    ids: string[],
    field: string,
    value: unknown,
  ): Promise<string[]> {
    const SET = BULK_CONTACT_FIELD_SQL[field]
    if (!SET) return []
    return this.updateReturningIds(
      schemaName,
      `UPDATE contacts
       SET ${SET}, updated_at = NOW()
       WHERE id = ANY($1::uuid[]) AND is_active = true
       RETURNING id`,
      [ids, value],
    )
  }

  async updateContactCustomField(
    schemaName: string,
    ids: string[],
    key: string,
    value: unknown,
  ): Promise<string[]> {
    return this.updateReturningIds(
      schemaName,
      `UPDATE contacts
       SET custom_fields = jsonb_strip_nulls(
             COALESCE(custom_fields, '{}'::jsonb) || jsonb_build_object($2::text, $3::jsonb)
           ),
           updated_at = NOW()
       WHERE id = ANY($1::uuid[]) AND is_active = true
       RETURNING id`,
      [ids, key, JSON.stringify(value ?? null)],
    )
  }

  async findMessageTemplate(
    schemaName: string,
    templateId: string,
  ): Promise<BulkMessageTemplateRow | null> {
    return this.db.query(schemaName, async (qr) => {
      const rows = await sqlRows<BulkMessageTemplateRow[]>(
        qr,
        `SELECT id, channel, format, subject, body
         FROM message_templates WHERE id = $1 AND is_active = true`,
        [templateId],
      )
      return rows[0] ?? null
    })
  }

  async findRecipients(
    schemaName: string,
    ids: string[],
    channel: 'email' | 'sms' | 'whatsapp',
  ): Promise<BulkRecipientRow[]> {
    return this.db.query(schemaName, async (qr) => {
      return sqlRows<BulkRecipientRow[]>(
        qr,
        `SELECT c.id, c.first_name, c.last_name, c.email, c.phone, c.whatsapp,
                EXISTS (
                  SELECT 1 FROM data_consents dc
                  WHERE dc.contact_id = c.id AND dc.channel = $2 AND dc.granted = false
                ) AS opted_out
         FROM contacts c
         WHERE c.id = ANY($1::uuid[]) AND c.is_active = true`,
        [ids, channel],
      )
    })
  }

  async findRowsForExport(
    schemaName: string,
    entity: CustomFieldEntity,
    ids: string[],
  ): Promise<Record<string, unknown>[]> {
    const TABLE = BULK_TABLES[entity]
    return this.db.query(schemaName, async (qr) => {
      return sqlRows<Record<string, unknown>[]>(
        qr,
        `SELECT * FROM ${TABLE} WHERE id = ANY($1::uuid[]) ORDER BY created_at ASC, id ASC`,
        [ids],
      )
    })
  }

  async readSnapshot(
    schemaName: string,
    entity: CustomFieldEntity,
    ids: string[],
    spec: SnapshotSpec,
  ): Promise<BulkSnapshotRow[]> {
    const TABLE = BULK_TABLES[entity]
    const COLUMNS = SNAPSHOT_COLUMNS.filter((column) => spec.columns.includes(column)).join(', ')
    const SELECT = [COLUMNS, spec.customKey ? 'custom_fields' : ''].filter(Boolean).join(', ')
    return this.db.query(schemaName, async (qr) => {
      const rows = await sqlRows<Array<Record<string, unknown> & { id: string }>>(
        qr,
        `SELECT id, ${SELECT} FROM ${TABLE} WHERE id = ANY($1::uuid[])`,
        [ids],
      )
      return rows.map(({ id, custom_fields, ...columns }) => ({
        entity_id: id,
        before: spec.customKey
          ? {
              ...columns,
              custom_fields: {
                [spec.customKey]:
                  (custom_fields as Record<string, unknown> | null)?.[spec.customKey] ?? null,
              },
            }
          : columns,
      }))
    })
  }

  async restoreSnapshot(
    schemaName: string,
    entity: CustomFieldEntity,
    entityId: string,
    before: SnapshotBefore,
  ): Promise<boolean> {
    const TABLE = BULK_TABLES[entity]
    const params: unknown[] = [entityId]
    const sets = SNAPSHOT_COLUMNS.filter((column) => column in before).map((column) => {
      params.push(before[column])
      return column === 'tags'
        ? `tags = $${params.length}::text[]`
        : `${column} = $${params.length}`
    })
    if (before.custom_fields) {
      params.push(JSON.stringify(before.custom_fields))
      sets.push(
        `custom_fields = jsonb_strip_nulls(COALESCE(custom_fields, '{}'::jsonb) || $${params.length}::jsonb)`,
      )
    }
    if (sets.length === 0) return false
    const updates = [...sets, 'updated_at = NOW()'].join(', ')
    const rows = await this.updateReturningIds(
      schemaName,
      `UPDATE ${TABLE} SET ${updates} WHERE id = $1 RETURNING id`,
      params,
    )
    return rows.length === 1
  }

  private async updateReturningIds(
    schemaName: string,
    sql: string,
    params: unknown[],
  ): Promise<string[]> {
    return this.db.query(schemaName, async (qr) => {
      const rows = await sqlRows<IdRow[]>(qr, sql, params)
      return rows.map((row) => row.id)
    })
  }
}
