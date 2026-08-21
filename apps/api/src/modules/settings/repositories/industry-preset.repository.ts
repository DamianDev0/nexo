import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { sqlRows } from '@/shared/database/sql.util'
import type { PresetTag } from '../constants/industry-presets'

@Injectable()
export class IndustryPresetRepository {
  constructor(private readonly db: TenantDbService) {}

  async insertTagsIfEmpty(schemaName: string, tags: PresetTag[]): Promise<boolean> {
    if (tags.length === 0) return false

    return this.db.transactional(schemaName, async (qr) => {
      const existing = await sqlRows<Array<{ id: string }>>(qr, `SELECT id FROM tags LIMIT 1`)
      if (existing.length > 0) return false

      const params: unknown[] = []
      const rows = tags.map((tag) => {
        params.push(tag.name, tag.color, tag.description ?? null)
        const base = params.length - 2
        return `($${base}, $${base + 1}, $${base + 2}, 'contact')`
      })

      await sqlRows(
        qr,
        `INSERT INTO tags (name, color, description, entity_type) VALUES ${rows.join(', ')}`,
        params,
      )
      return true
    })
  }
}
