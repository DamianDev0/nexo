import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { validateNIT, DEFAULT_PAGE_SIZE } from '@repo/shared-utils'
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service'
import { AuditAction, AuditEntityType } from '@/modules/audit-log/interfaces/audit-log.interfaces'
import type { Company, PaginatedCompanies, CompanySummary } from '@repo/shared-types'
import type { CreateCompanyDto, UpdateCompanyDto, CompanyQueryDto } from '../dto/company.dto'
import type { CompanyRow, CompanyFieldUpdate } from '../interfaces/company-row.interfaces'
import { UPDATABLE_FIELDS } from '../constants/company.constants'
import { CompaniesRepository } from '../repositories/companies.repository'
import {
  mapCompany,
  mapCompanyListItem,
  mapCompanyStats,
  mapCompanyContactItem,
  mapCompanyDealItem,
} from '../mappers/company.mapper'

@Injectable()
export class CompaniesService {
  constructor(
    private readonly companies: CompaniesRepository,
    private readonly audit: AuditLogService,
  ) {}

  async findAll(schemaName: string, query: CompanyQueryDto): Promise<PaginatedCompanies> {
    const page = query.page ?? 1
    const limit = query.limit ?? DEFAULT_PAGE_SIZE
    const offset = (page - 1) * limit

    const { rows, total } = await this.companies.findPage(schemaName, query, limit, offset)

    return { data: rows.map((r) => mapCompanyListItem(r)), total, page, limit }
  }

  async findOne(schemaName: string, companyId: string): Promise<Company> {
    const rows = await this.companies.findById(schemaName, companyId)

    if (rows.length === 0) {
      throw new NotFoundException(`Company ${companyId} not found`)
    }

    return this.mapRowOrFail(rows)
  }

  async create(schemaName: string, dto: CreateCompanyDto, createdById: string): Promise<Company> {
    const { nit, nitDv } = this.resolveNit(dto.nit)

    const rows = await this.companies.insert(schemaName, {
      name: dto.name,
      nit,
      nitDv,
      taxRegime: dto.taxRegime ?? null,
      companySize: dto.companySize ?? null,
      sectorCiiu: dto.sectorCiiu ?? null,
      website: dto.website ?? null,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      address: dto.address ?? null,
      city: dto.city ?? null,
      department: dto.department ?? null,
      municipioCode: dto.municipioCode ?? null,
      tags: dto.tags ?? [],
      assignedToId: dto.assignedToId ?? null,
      customFields: dto.customFields ?? {},
      createdById,
    })

    const result = this.mapRowOrFail(rows)
    void this.audit.entityEvent(
      schemaName,
      AuditAction.CompanyCreated,
      AuditEntityType.Company,
      result.id,
      createdById,
      `Company ${dto.name} created`,
    )
    return result
  }

  async update(schemaName: string, companyId: string, dto: UpdateCompanyDto): Promise<Company> {
    const fields: CompanyFieldUpdate[] = []
    for (const [dtoKey, col] of UPDATABLE_FIELDS) {
      if (dto[dtoKey] !== undefined) {
        fields.push([col, dto[dtoKey]])
      }
    }

    const rows = await this.companies.update(
      schemaName,
      companyId,
      dto.nit !== undefined ? () => this.resolveNit(dto.nit) : null,
      fields,
    )

    const result = this.mapRowOrFail(rows)
    void this.audit.entityEvent(
      schemaName,
      AuditAction.CompanyUpdated,
      AuditEntityType.Company,
      companyId,
      undefined,
      `Company ${companyId} updated`,
    )
    return result
  }

  async remove(schemaName: string, companyId: string): Promise<void> {
    await this.companies.softDelete(schemaName, companyId)
    void this.audit.entityEvent(
      schemaName,
      AuditAction.CompanyDeleted,
      AuditEntityType.Company,
      companyId,
      undefined,
      `Company ${companyId} deleted`,
    )
  }

  async getSummary(schemaName: string, companyId: string): Promise<CompanySummary> {
    const { company, stats, contacts, deals } = await this.companies.findSummaryRows(
      schemaName,
      companyId,
    )

    return {
      ...mapCompany(company),
      stats: mapCompanyStats(stats),
      contacts: contacts.map((r) => mapCompanyContactItem(r)),
      deals: deals.map((r) => mapCompanyDealItem(r)),
    }
  }

  async assignContact(schemaName: string, companyId: string, contactId: string): Promise<void> {
    const updated = await this.companies.assignContact(schemaName, companyId, contactId)

    if (updated === 0) {
      throw new NotFoundException(`Contact ${contactId} not found`)
    }
  }

  async removeContact(schemaName: string, companyId: string, contactId: string): Promise<void> {
    const updated = await this.companies.removeContact(schemaName, companyId, contactId)

    if (updated === 0) {
      throw new NotFoundException(`Contact ${contactId} is not assigned to company ${companyId}`)
    }
  }

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

  private mapRowOrFail(rows: CompanyRow[]): Company {
    const row = rows[0]
    if (!row) throw new NotFoundException('Company not found')
    return mapCompany(row)
  }
}
