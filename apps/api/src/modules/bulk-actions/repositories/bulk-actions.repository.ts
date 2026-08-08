import { Injectable } from '@nestjs/common'
import type { BulkActionResult, CustomFieldEntity } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'

@Injectable()
export class BulkActionsRepository {
  constructor(private readonly db: TenantDbService) {}

  async assignMany(
    schemaName: string,
    table: CustomFieldEntity,
    ids: string[],
    assignedToId: string,
  ): Promise<BulkActionResult> {
    return this.updateEach(
      schemaName,
      `UPDATE ${table} SET assigned_to_id = $1, updated_at = NOW() WHERE id = $2 AND is_active = true`,
      ids,
      assignedToId,
    )
  }

  async addTagsMany(
    schemaName: string,
    table: CustomFieldEntity,
    ids: string[],
    tags: string[],
  ): Promise<BulkActionResult> {
    return this.updateEach(
      schemaName,
      `UPDATE ${table} SET tags = array_cat(tags, $1), updated_at = NOW() WHERE id = $2 AND is_active = true`,
      ids,
      tags,
    )
  }

  async removeTagsMany(
    schemaName: string,
    table: CustomFieldEntity,
    ids: string[],
    tags: string[],
  ): Promise<BulkActionResult> {
    return this.updateEach(
      schemaName,
      `UPDATE ${table} SET tags = array(SELECT unnest(tags) EXCEPT SELECT unnest($1::text[])), updated_at = NOW() WHERE id = $2 AND is_active = true`,
      ids,
      tags,
    )
  }

  private updateEach(
    schemaName: string,
    sql: string,
    ids: string[],
    value: unknown,
  ): Promise<BulkActionResult> {
    return this.db.query(schemaName, async (qr): Promise<BulkActionResult> => {
      let processed = 0
      const errors: { id: string; message: string }[] = []

      for (const id of ids) {
        try {
          await qr.query(sql, [value, id])
          processed++
        } catch (err) {
          errors.push({ id, message: err instanceof Error ? err.message : 'Unknown error' })
        }
      }

      return { processed, failed: errors.length, errors }
    })
  }

  async deactivateMany(schemaName: string, table: CustomFieldEntity, ids: string[]): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ')
      await qr.query(
        `UPDATE ${table} SET is_active = false, updated_at = NOW() WHERE id IN (${placeholders}) AND is_active = true`,
        ids,
      )
    })
  }
}
