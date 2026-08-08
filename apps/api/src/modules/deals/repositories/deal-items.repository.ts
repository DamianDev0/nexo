import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { DEFAULT_VAT_RATE } from '@repo/shared-utils'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { DealItemRow } from '../interfaces/deal-row.interfaces'
import type { CreateDealItemInput, UpdateDealItemInput } from '../interfaces/deal-input.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class DealItemsRepository {
  constructor(private readonly db: TenantDbService) {}

  async listByDeal(schemaName: string, dealId: string): Promise<DealItemRow[]> {
    return this.db.query(schemaName, async (qr): Promise<DealItemRow[]> => {
      await this.assertDealExists(qr, dealId)
      const rows = await sqlRows<DealItemRow[]>(
        qr,
        `SELECT * FROM deal_items WHERE deal_id = $1 ORDER BY position ASC`,
        [dealId],
      )
      return rows
    })
  }

  async add(schemaName: string, dealId: string, input: CreateDealItemInput): Promise<DealItemRow> {
    return this.db.transactional(schemaName, async (qr): Promise<DealItemRow> => {
      await this.assertDealExists(qr, dealId)

      const position = await this.getNextItemPosition(qr, dealId)

      const rows = await sqlRows<DealItemRow[]>(
        qr,
        `INSERT INTO deal_items (deal_id, product_id, description, quantity, unit_price_cents, discount_percent, iva_rate, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          dealId,
          input.productId ?? null,
          input.description,
          input.quantity ?? 1,
          input.unitPriceCents,
          input.discountPercent ?? 0,
          input.ivaRate ?? DEFAULT_VAT_RATE,
          position,
        ],
      )

      const row = rows[0]
      if (!row) throw new BadRequestException('Failed to create deal item')

      await this.recalcDealValue(qr, dealId)
      return row
    })
  }

  async update(
    schemaName: string,
    dealId: string,
    itemId: string,
    input: UpdateDealItemInput,
  ): Promise<DealItemRow> {
    return this.db.transactional(schemaName, async (qr): Promise<DealItemRow> => {
      await this.assertItemExists(qr, itemId, dealId)

      const sets: string[] = []
      const params: unknown[] = []

      if (input.description !== undefined) {
        params.push(input.description)
        sets.push(`description = $${params.length}`)
      }
      if (input.productId !== undefined) {
        params.push(input.productId)
        sets.push(`product_id = $${params.length}`)
      }
      if (input.quantity !== undefined) {
        params.push(input.quantity)
        sets.push(`quantity = $${params.length}`)
      }
      if (input.unitPriceCents !== undefined) {
        params.push(input.unitPriceCents)
        sets.push(`unit_price_cents = $${params.length}`)
      }
      if (input.discountPercent !== undefined) {
        params.push(input.discountPercent)
        sets.push(`discount_percent = $${params.length}`)
      }
      if (input.ivaRate !== undefined) {
        params.push(input.ivaRate)
        sets.push(`iva_rate = $${params.length}`)
      }

      if (sets.length === 0) {
        return this.fetchItemOrFail(qr, itemId)
      }

      params.push(itemId)
      await qr.query(
        `UPDATE deal_items SET ${sets.join(', ')} WHERE id = $${params.length}`,
        params,
      )

      await this.recalcDealValue(qr, dealId)
      return this.fetchItemOrFail(qr, itemId)
    })
  }

  async remove(schemaName: string, dealId: string, itemId: string): Promise<void> {
    return this.db.transactional(schemaName, async (qr): Promise<void> => {
      await this.assertItemExists(qr, itemId, dealId)
      await qr.query(`DELETE FROM deal_items WHERE id = $1 AND deal_id = $2`, [itemId, dealId])
      await this.recalcDealValue(qr, dealId)
    })
  }

  private async assertDealExists(qr: QueryRunner, dealId: string): Promise<void> {
    const rows = await sqlRows<[{ id: string }?]>(
      qr,
      `SELECT id FROM deals WHERE id = $1 AND is_active = true`,
      [dealId],
    )

    if (rows.length === 0) {
      throw new NotFoundException(`Deal ${dealId} not found`)
    }
  }

  private async assertItemExists(qr: QueryRunner, itemId: string, dealId: string): Promise<void> {
    const rows = await sqlRows<[{ id: string }?]>(
      qr,
      `SELECT id FROM deal_items WHERE id = $1 AND deal_id = $2`,
      [itemId, dealId],
    )

    if (rows.length === 0) {
      throw new NotFoundException(`Item ${itemId} not found in deal ${dealId}`)
    }
  }

  private async fetchItemOrFail(qr: QueryRunner, itemId: string): Promise<DealItemRow> {
    const rows = await sqlRows<DealItemRow[]>(qr, `SELECT * FROM deal_items WHERE id = $1`, [
      itemId,
    ])

    const row = rows[0]
    if (!row) throw new NotFoundException(`Item ${itemId} not found`)
    return row
  }

  private async getNextItemPosition(qr: QueryRunner, dealId: string): Promise<number> {
    const rows = await sqlRows<[{ max_pos: number | null }]>(
      qr,
      `SELECT MAX(position) AS max_pos FROM deal_items WHERE deal_id = $1`,
      [dealId],
    )
    return (rows[0].max_pos ?? -1) + 1
  }

  private async recalcDealValue(qr: QueryRunner, dealId: string): Promise<void> {
    await qr.query(
      `UPDATE deals SET
         value_cents = COALESCE((
           SELECT SUM(quantity * unit_price_cents * (100 - discount_percent) / 100)
           FROM deal_items WHERE deal_id = $1
         ), 0),
         updated_at = NOW()
       WHERE id = $1`,
      [dealId],
    )
  }
}
