import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  CompanyRow,
  ContactRow,
  DealRow,
  StatsRow,
  CompanyListFilters,
  CompanyInsertValues,
  CompanyNitResolver,
  CompanyFieldUpdate,
  CompanySummaryRows,
} from '../interfaces/company-row.interfaces'
import { COMPANY_COLUMNS, COMPANY_LIST_COLUMNS } from '../constants/company.constants'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class CompaniesRepository {
  constructor(private readonly db: TenantDbService) {}

  async findPage(
    schemaName: string,
    filters: CompanyListFilters,
    limit: number,
    offset: number,
  ): Promise<{ rows: CompanyRow[]; total: number }> {
    return this.db.query(schemaName, async (qr) => {
      const { where, params } = this.buildWhereClause(filters)

      const countRows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM companies WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const dataParams = [...params, limit, offset]
      const rows = await sqlRows<CompanyRow[]>(
        qr,
        `SELECT ${COMPANY_LIST_COLUMNS}
         FROM companies
         WHERE ${where}
         ORDER BY name ASC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { rows, total }
    })
  }

  async findById(schemaName: string, companyId: string): Promise<CompanyRow[]> {
    return this.db.query(schemaName, (qr) => this.fetchCompany(qr, companyId))
  }

  async insert(schemaName: string, values: CompanyInsertValues): Promise<CompanyRow[]> {
    return this.db.query(schemaName, async (qr): Promise<CompanyRow[]> => {
      if (values.nit) {
        await this.assertNitUnique(qr, values.nit)
      }

      const rows = await sqlRows<CompanyRow[]>(
        qr,
        `INSERT INTO companies (
           name, nit, nit_dv, tax_regime, company_size, sector_ciiu,
           website, phone, email, address, city, department, municipio_code,
           tags, assigned_to_id, custom_fields, created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING ${COMPANY_COLUMNS}`,
        [
          values.name,
          values.nit,
          values.nitDv,
          values.taxRegime,
          values.companySize,
          values.sectorCiiu,
          values.website,
          values.phone,
          values.email,
          values.address,
          values.city,
          values.department,
          values.municipioCode,
          values.tags,
          values.assignedToId,
          values.customFields,
          values.createdById,
        ],
      )

      return rows
    })
  }

  async update(
    schemaName: string,
    companyId: string,
    resolveNit: CompanyNitResolver | null,
    fields: CompanyFieldUpdate[],
  ): Promise<CompanyRow[]> {
    return this.db.query(schemaName, async (qr): Promise<CompanyRow[]> => {
      await this.assertCompanyExists(qr, companyId)

      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      if (resolveNit) {
        const { nit, nitDv } = resolveNit()
        if (nit) {
          await this.assertNitUnique(qr, nit, companyId)
        }
        params.push(nit)
        sets.push(`nit = $${params.length}`)
        params.push(nitDv)
        sets.push(`nit_dv = $${params.length}`)
      }

      for (const [col, value] of fields) {
        params.push(value)
        sets.push(`${col} = $${params.length}`)
      }

      params.push(companyId)
      const rows = await sqlRows<CompanyRow[]>(
        qr,
        `UPDATE companies
         SET ${sets.join(', ')}
         WHERE id = $${params.length} AND is_active = true
         RETURNING ${COMPANY_COLUMNS}`,
        params,
      )

      return rows
    })
  }

  async softDelete(schemaName: string, companyId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      await this.assertCompanyExists(qr, companyId)
      await qr.query(`UPDATE companies SET is_active = false, updated_at = NOW() WHERE id = $1`, [
        companyId,
      ])
    })
  }

  async findSummaryRows(schemaName: string, companyId: string): Promise<CompanySummaryRows> {
    return this.db.query(schemaName, async (qr): Promise<CompanySummaryRows> => {
      const companyRows = await this.fetchCompany(qr, companyId)
      const company = companyRows[0]
      if (!company) {
        throw new NotFoundException(`Company ${companyId} not found`)
      }

      const statsRows = await sqlRows<StatsRow[]>(
        qr,
        `SELECT
           (SELECT COUNT(*)::text         FROM contacts WHERE company_id=$1 AND is_active=true)                                     AS contact_count,
           (SELECT COUNT(*)::text         FROM deals    WHERE company_id=$1 AND is_active=true AND status='open')                   AS active_deal_count,
           (SELECT COALESCE(SUM(value_cents),0)::text FROM deals WHERE company_id=$1 AND is_active=true AND status='open')          AS total_deals_value_cents,
           (SELECT COUNT(*)::text         FROM invoices WHERE company_id=$1)                                                        AS invoice_count,
           (SELECT COALESCE(SUM(total_cents),0)::text FROM invoices WHERE company_id=$1 AND status IN ('approved','paid'))          AS total_billed_cents,
           (SELECT COALESCE(SUM(total_cents),0)::text FROM invoices WHERE company_id=$1 AND status NOT IN ('paid','voided','draft')) AS pending_debt_cents`,
        [companyId],
      )

      const contactRows = await sqlRows<ContactRow[]>(
        qr,
        `SELECT id, first_name, last_name, email, phone, status, created_at
         FROM contacts
         WHERE company_id = $1 AND is_active = true
         ORDER BY created_at DESC
         LIMIT 50`,
        [companyId],
      )

      const dealRows = await sqlRows<DealRow[]>(
        qr,
        `SELECT id, title, value_cents, status, stage_id, expected_close_date, created_at
         FROM deals
         WHERE company_id = $1 AND is_active = true
         ORDER BY created_at DESC
         LIMIT 20`,
        [companyId],
      )

      return {
        company,
        stats: statsRows,
        contacts: contactRows,
        deals: dealRows,
      }
    })
  }

  async assignContact(schemaName: string, companyId: string, contactId: string): Promise<number> {
    return this.db.query(schemaName, async (qr): Promise<number> => {
      await this.assertCompanyExists(qr, companyId)

      const rows = await sqlRows<[{ id: string }?]>(
        qr,
        `UPDATE contacts
         SET company_id = $1, updated_at = NOW()
         WHERE id = $2 AND is_active = true
         RETURNING id`,
        [companyId, contactId],
      )

      return rows.length
    })
  }

  async removeContact(schemaName: string, companyId: string, contactId: string): Promise<number> {
    return this.db.query(schemaName, async (qr): Promise<number> => {
      const rows = await sqlRows<[{ id: string }?]>(
        qr,
        `UPDATE contacts
         SET company_id = NULL, updated_at = NOW()
         WHERE id = $1 AND company_id = $2 AND is_active = true
         RETURNING id`,
        [contactId, companyId],
      )

      return rows.length
    })
  }

  private async fetchCompany(qr: QueryRunner, companyId: string): Promise<CompanyRow[]> {
    return sqlRows<CompanyRow[]>(
      qr,
      `SELECT ${COMPANY_COLUMNS} FROM companies WHERE id = $1 AND is_active = true`,
      [companyId],
    )
  }

  private async assertCompanyExists(qr: QueryRunner, companyId: string): Promise<void> {
    const rows = await sqlRows<[{ id: string }?]>(
      qr,
      `SELECT id FROM companies WHERE id = $1 AND is_active = true`,
      [companyId],
    )

    if (rows.length === 0) {
      throw new NotFoundException(`Company ${companyId} not found`)
    }
  }

  private async assertNitUnique(qr: QueryRunner, nit: string, excludeId?: string): Promise<void> {
    const rows = excludeId
      ? await sqlRows<[{ id: string }?]>(
          qr,
          `SELECT id FROM companies WHERE nit = $1 AND is_active = true AND id != $2 LIMIT 1`,
          [nit, excludeId],
        )
      : await sqlRows<[{ id: string }?]>(
          qr,
          `SELECT id FROM companies WHERE nit = $1 AND is_active = true LIMIT 1`,
          [nit],
        )

    if (rows.length > 0) {
      throw new ConflictException(`A company with NIT ${nit} already exists`)
    }
  }

  private buildWhereClause(filters: CompanyListFilters): {
    where: string
    params: unknown[]
  } {
    const conditions: string[] = ['is_active = true']
    const params: unknown[] = []

    if (filters.q) {
      params.push(filters.q)
      conditions.push(
        `to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(nit,'')) @@ plainto_tsquery('spanish', $${params.length})`,
      )
    }

    if (filters.taxRegime) {
      params.push(filters.taxRegime)
      conditions.push(`tax_regime = $${params.length}`)
    }

    if (filters.companySize) {
      params.push(filters.companySize)
      conditions.push(`company_size = $${params.length}`)
    }

    if (filters.sectorCiiu) {
      params.push(filters.sectorCiiu)
      conditions.push(`sector_ciiu = $${params.length}`)
    }

    if (filters.city) {
      params.push(`%${filters.city}%`)
      conditions.push(`city ILIKE $${params.length}`)
    }

    if (filters.assignedToId) {
      params.push(filters.assignedToId)
      conditions.push(`assigned_to_id = $${params.length}`)
    }

    if (filters.tags && filters.tags.length > 0) {
      params.push(filters.tags)
      conditions.push(`tags @> $${params.length}`)
    }

    return { where: conditions.join(' AND '), params }
  }
}
