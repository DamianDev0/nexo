import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { validateNIT, formatNIT } from '@repo/shared-utils'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  Company,
  CompanyListItem,
  PaginatedCompanies,
  CompanySummary,
  CompanyStats,
  CompanyContactItem,
  CompanyDealItem,
} from '@repo/shared-types'
import type { CreateCompanyDto, UpdateCompanyDto, CompanyQueryDto } from './dto/company.dto'
import type { CompanyRow, ContactRow, DealRow, StatsRow } from './interfaces/company-row.interfaces'
import {
  UPDATABLE_FIELDS,
  COMPANY_COLUMNS,
  COMPANY_LIST_COLUMNS,
} from './constants/company.constants'

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class CompaniesService {
  constructor(private readonly db: TenantDbService) {}

  // ─── List ─────────────────────────────────────────────────────────────────

  async findAll(schemaName: string, query: CompanyQueryDto): Promise<PaginatedCompanies> {
    return this.db.query(schemaName, async (qr): Promise<PaginatedCompanies> => {
      const page = query.page ?? 1
      const limit = query.limit ?? 25
      const offset = (page - 1) * limit

      const { where, params } = this.buildWhereClause(query)

      const countRows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count FROM companies WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const dataParams = [...params, limit, offset]
      const rows: CompanyRow[] = await qr.query(
        `SELECT ${COMPANY_LIST_COLUMNS}
         FROM companies
         WHERE ${where}
         ORDER BY name ASC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { data: rows.map((r) => this.mapListItem(r)), total, page, limit }
    })
  }

  // ─── Find one ─────────────────────────────────────────────────────────────

  async findOne(schemaName: string, companyId: string): Promise<Company> {
    return this.db.query(schemaName, (qr) => this.fetchCompanyOrFail(qr, companyId))
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(schemaName: string, dto: CreateCompanyDto, createdById: string): Promise<Company> {
    const { nit, nitDv } = this.resolveNit(dto.nit)

    return this.db.query(schemaName, async (qr): Promise<Company> => {
      if (nit) {
        await this.assertNitUnique(qr, nit)
      }

      const rows: CompanyRow[] = await qr.query(
        `INSERT INTO companies (
           name, nit, nit_dv, tax_regime, company_size, sector_ciiu,
           website, phone, email, address, city, department, municipio_code,
           tags, assigned_to_id, custom_fields, created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING ${COMPANY_COLUMNS}`,
        [
          dto.name,
          nit,
          nitDv,
          dto.taxRegime ?? null,
          dto.companySize ?? null,
          dto.sectorCiiu ?? null,
          dto.website ?? null,
          dto.phone ?? null,
          dto.email ?? null,
          dto.address ?? null,
          dto.city ?? null,
          dto.department ?? null,
          dto.municipioCode ?? null,
          dto.tags ?? [],
          dto.assignedToId ?? null,
          dto.customFields ?? {},
          createdById,
        ],
      )

      return this.mapRow(rows)
    })
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(schemaName: string, companyId: string, dto: UpdateCompanyDto): Promise<Company> {
    return this.db.query(schemaName, async (qr): Promise<Company> => {
      await this.assertCompanyExists(qr, companyId)

      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      // Handle NIT separately — needs DV recalculation + uniqueness check
      if (dto.nit !== undefined) {
        const { nit, nitDv } = this.resolveNit(dto.nit)
        if (nit) {
          await this.assertNitUnique(qr, nit, companyId)
        }
        params.push(nit)
        sets.push(`nit = $${params.length}`)
        params.push(nitDv)
        sets.push(`nit_dv = $${params.length}`)
      }

      for (const [dtoKey, col] of UPDATABLE_FIELDS) {
        if (dto[dtoKey] !== undefined) {
          params.push(dto[dtoKey])
          sets.push(`${col} = $${params.length}`)
        }
      }

      params.push(companyId)
      const rows: CompanyRow[] = await qr.query(
        `UPDATE companies
         SET ${sets.join(', ')}
         WHERE id = $${params.length} AND is_active = true
         RETURNING ${COMPANY_COLUMNS}`,
        params,
      )

      return this.mapRow(rows)
    })
  }

  // ─── Delete (soft) ────────────────────────────────────────────────────────

  async remove(schemaName: string, companyId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      await this.assertCompanyExists(qr, companyId)
      await qr.query(`UPDATE companies SET is_active = false, updated_at = NOW() WHERE id = $1`, [
        companyId,
      ])
    })
  }

  // ─── Summary ─────────────────────────────────────────────────────────────

  async getSummary(schemaName: string, companyId: string): Promise<CompanySummary> {
    return this.db.query(schemaName, async (qr): Promise<CompanySummary> => {
      const company = await this.fetchCompanyOrFail(qr, companyId)

      const statsRows: StatsRow[] = await qr.query(
        `SELECT
           (SELECT COUNT(*)::text         FROM contacts WHERE company_id=$1 AND is_active=true)                                     AS contact_count,
           (SELECT COUNT(*)::text         FROM deals    WHERE company_id=$1 AND is_active=true AND status='open')                   AS active_deal_count,
           (SELECT COALESCE(SUM(value_cents),0)::text FROM deals WHERE company_id=$1 AND is_active=true AND status='open')          AS total_deals_value_cents,
           (SELECT COUNT(*)::text         FROM invoices WHERE company_id=$1)                                                        AS invoice_count,
           (SELECT COALESCE(SUM(total_cents),0)::text FROM invoices WHERE company_id=$1 AND status IN ('approved','paid'))          AS total_billed_cents,
           (SELECT COALESCE(SUM(total_cents),0)::text FROM invoices WHERE company_id=$1 AND status NOT IN ('paid','voided','draft')) AS pending_debt_cents`,
        [companyId],
      )

      const contactRows: ContactRow[] = await qr.query(
        `SELECT id, first_name, last_name, email, phone, status, created_at
         FROM contacts
         WHERE company_id = $1 AND is_active = true
         ORDER BY created_at DESC
         LIMIT 50`,
        [companyId],
      )

      const dealRows: DealRow[] = await qr.query(
        `SELECT id, title, value_cents, status, stage_id, expected_close_date, created_at
         FROM deals
         WHERE company_id = $1 AND is_active = true
         ORDER BY created_at DESC
         LIMIT 20`,
        [companyId],
      )

      const stat = statsRows[0] ?? ({} as StatsRow)
      const stats: CompanyStats = {
        contactCount: Number(stat.contact_count ?? 0),
        activeDealCount: Number(stat.active_deal_count ?? 0),
        totalDealsValueCents: Number(stat.total_deals_value_cents ?? 0),
        invoiceCount: Number(stat.invoice_count ?? 0),
        totalBilledCents: Number(stat.total_billed_cents ?? 0),
        pendingDebtCents: Number(stat.pending_debt_cents ?? 0),
      }

      return {
        ...company,
        stats,
        contacts: contactRows.map(
          (r): CompanyContactItem => ({
            id: r.id,
            firstName: r.first_name,
            lastName: r.last_name,
            email: r.email,
            phone: r.phone,
            status: r.status,
            createdAt: r.created_at,
          }),
        ),
        deals: dealRows.map(
          (r): CompanyDealItem => ({
            id: r.id,
            title: r.title,
            valueCents: Number(r.value_cents),
            status: r.status,
            stageId: r.stage_id,
            expectedCloseDate: r.expected_close_date,
            createdAt: r.created_at,
          }),
        ),
      }
    })
  }

  // ─── Assign contact ───────────────────────────────────────────────────────

  async assignContact(schemaName: string, companyId: string, contactId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      await this.assertCompanyExists(qr, companyId)

      const rows: [{ id: string }?] = await qr.query(
        `UPDATE contacts
         SET company_id = $1, updated_at = NOW()
         WHERE id = $2 AND is_active = true
         RETURNING id`,
        [companyId, contactId],
      )

      if (rows.length === 0) {
        throw new NotFoundException(`Contact ${contactId} not found`)
      }
    })
  }

  // ─── Remove contact ───────────────────────────────────────────────────────

  async removeContact(schemaName: string, companyId: string, contactId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      const rows: [{ id: string }?] = await qr.query(
        `UPDATE contacts
         SET company_id = NULL, updated_at = NOW()
         WHERE id = $1 AND company_id = $2 AND is_active = true
         RETURNING id`,
        [contactId, companyId],
      )

      if (rows.length === 0) {
        throw new NotFoundException(`Contact ${contactId} is not assigned to company ${companyId}`)
      }
    })
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async fetchCompanyOrFail(qr: QueryRunner, companyId: string): Promise<Company> {
    const rows: CompanyRow[] = await qr.query(
      `SELECT ${COMPANY_COLUMNS} FROM companies WHERE id = $1 AND is_active = true`,
      [companyId],
    )

    if (rows.length === 0) {
      throw new NotFoundException(`Company ${companyId} not found`)
    }

    return this.mapRow(rows)
  }

  private async assertCompanyExists(qr: QueryRunner, companyId: string): Promise<void> {
    const rows: [{ id: string }?] = await qr.query(
      `SELECT id FROM companies WHERE id = $1 AND is_active = true`,
      [companyId],
    )

    if (rows.length === 0) {
      throw new NotFoundException(`Company ${companyId} not found`)
    }
  }

  /** Throws ConflictException if another active company already has this NIT. */
  private async assertNitUnique(qr: QueryRunner, nit: string, excludeId?: string): Promise<void> {
    const rows: [{ id: string }?] = excludeId
      ? await qr.query(
          `SELECT id FROM companies WHERE nit = $1 AND is_active = true AND id != $2 LIMIT 1`,
          [nit, excludeId],
        )
      : await qr.query(`SELECT id FROM companies WHERE nit = $1 AND is_active = true LIMIT 1`, [
          nit,
        ])

    if (rows.length > 0) {
      throw new ConflictException(`A company with NIT ${nit} already exists`)
    }
  }

  /**
   * Validates and strips a NIT string, returning the 9-digit value and its DV.
   * Accepts: "900123456", "900.123.456-7", "9001234567"
   */
  private resolveNit(rawNit: string | undefined): { nit: string | null; nitDv: string | null } {
    if (!rawNit) return { nit: null, nitDv: null }

    const result = validateNIT(rawNit)
    if (!result.isValid || !result.nit || !result.checkDigit) {
      throw new BadRequestException(
        `Invalid NIT: "${rawNit}". Must be a valid Colombian NIT (9 digits, optionally with check digit).`,
      )
    }

    return { nit: result.nit, nitDv: result.checkDigit }
  }

  private buildWhereClause(query: CompanyQueryDto): {
    where: string
    params: unknown[]
  } {
    const conditions: string[] = ['is_active = true']
    const params: unknown[] = []

    if (query.q) {
      params.push(query.q)
      conditions.push(
        `to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(nit,'')) @@ plainto_tsquery('spanish', $${params.length})`,
      )
    }

    if (query.taxRegime) {
      params.push(query.taxRegime)
      conditions.push(`tax_regime = $${params.length}`)
    }

    if (query.companySize) {
      params.push(query.companySize)
      conditions.push(`company_size = $${params.length}`)
    }

    if (query.sectorCiiu) {
      params.push(query.sectorCiiu)
      conditions.push(`sector_ciiu = $${params.length}`)
    }

    if (query.city) {
      params.push(`%${query.city}%`)
      conditions.push(`city ILIKE $${params.length}`)
    }

    if (query.assignedToId) {
      params.push(query.assignedToId)
      conditions.push(`assigned_to_id = $${params.length}`)
    }

    if (query.tags && query.tags.length > 0) {
      params.push(query.tags)
      conditions.push(`tags @> $${params.length}`)
    }

    return { where: conditions.join(' AND '), params }
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  /** Extracts the first row from a RETURNING/SELECT result — avoids non-null assertions. */
  private mapRow(rows: CompanyRow[]): Company {
    const row = rows[0]
    if (!row) throw new NotFoundException('Company not found')
    return this.mapCompany(row)
  }

  private mapCompany(r: CompanyRow): Company {
    return {
      id: r.id,
      name: r.name,
      nit: r.nit,
      nitDv: r.nit_dv,
      nitFormatted: r.nit && r.nit_dv ? formatNIT(r.nit, r.nit_dv) : null,
      taxRegime: r.tax_regime as Company['taxRegime'],
      companySize: r.company_size as Company['companySize'],
      sectorCiiu: r.sector_ciiu as Company['sectorCiiu'],
      website: r.website,
      phone: r.phone,
      email: r.email,
      address: r.address,
      city: r.city,
      department: r.department,
      municipioCode: r.municipio_code,
      tags: r.tags ?? [],
      assignedToId: r.assigned_to_id,
      customFields: r.custom_fields ?? {},
      isActive: r.is_active,
      createdById: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }

  private mapListItem(r: CompanyRow): CompanyListItem {
    const { customFields: _cf, ...rest } = this.mapCompany({ ...r, custom_fields: {} })
    return rest
  }
}
