import { BadRequestException, Injectable } from '@nestjs/common'
import type { BulkActionResult } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'

type EntityTable = 'contacts' | 'companies' | 'deals'

const ALLOWED_TABLES = new Set<EntityTable>(['contacts', 'companies', 'deals'])

@Injectable()
export class BulkActionsService {
  constructor(private readonly db: TenantDbService) {}

  async assign(
    schemaName: string,
    entity: string,
    ids: string[],
    assignedToId: string,
  ): Promise<BulkActionResult> {
    const table = this.validateTable(entity)
    return this.db.query(schemaName, async (qr): Promise<BulkActionResult> => {
      let processed = 0
      const errors: { id: string; message: string }[] = []

      for (const id of ids) {
        try {
          await qr.query(
            `UPDATE ${table} SET assigned_to_id = $1, updated_at = NOW() WHERE id = $2 AND is_active = true`,
            [assignedToId, id],
          )
          processed++
        } catch (err) {
          errors.push({ id, message: err instanceof Error ? err.message : 'Unknown error' })
        }
      }

      return { processed, failed: errors.length, errors }
    })
  }

  async tag(
    schemaName: string,
    entity: string,
    ids: string[],
    tags: string[],
  ): Promise<BulkActionResult> {
    const table = this.validateTable(entity)
    return this.db.query(schemaName, async (qr): Promise<BulkActionResult> => {
      let processed = 0
      const errors: { id: string; message: string }[] = []

      for (const id of ids) {
        try {
          await qr.query(
            `UPDATE ${table} SET tags = array_cat(tags, $1), updated_at = NOW() WHERE id = $2 AND is_active = true`,
            [tags, id],
          )
          processed++
        } catch (err) {
          errors.push({ id, message: err instanceof Error ? err.message : 'Unknown error' })
        }
      }

      return { processed, failed: errors.length, errors }
    })
  }

  async untag(
    schemaName: string,
    entity: string,
    ids: string[],
    tags: string[],
  ): Promise<BulkActionResult> {
    const table = this.validateTable(entity)
    return this.db.query(schemaName, async (qr): Promise<BulkActionResult> => {
      let processed = 0
      const errors: { id: string; message: string }[] = []

      for (const id of ids) {
        try {
          await qr.query(
            `UPDATE ${table} SET tags = array(SELECT unnest(tags) EXCEPT SELECT unnest($1::text[])), updated_at = NOW() WHERE id = $2 AND is_active = true`,
            [tags, id],
          )
          processed++
        } catch (err) {
          errors.push({ id, message: err instanceof Error ? err.message : 'Unknown error' })
        }
      }

      return { processed, failed: errors.length, errors }
    })
  }

  async softDelete(schemaName: string, entity: string, ids: string[]): Promise<BulkActionResult> {
    const table = this.validateTable(entity)
    return this.db.query(schemaName, async (qr): Promise<BulkActionResult> => {
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ')
      await qr.query(
        `UPDATE ${table} SET is_active = false, updated_at = NOW() WHERE id IN (${placeholders}) AND is_active = true`,
        ids,
      )
      return { processed: ids.length, failed: 0, errors: [] }
    })
  }

  private validateTable(entity: string): EntityTable {
    if (!ALLOWED_TABLES.has(entity as EntityTable)) {
      throw new BadRequestException(
        `Bulk actions not supported for entity "${entity}". Allowed: ${[...ALLOWED_TABLES].join(', ')}`,
      )
    }
    return entity as EntityTable
  }
}
