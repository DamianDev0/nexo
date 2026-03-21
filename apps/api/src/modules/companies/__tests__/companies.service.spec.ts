import { AuditLogService } from '@/shared/audit-log/audit-log.service'
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { CompaniesService } from '../companies.service'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { Company, PaginatedCompanies, CompanySummary } from '@repo/shared-types'
import { TaxRegime, CompanySize, CIIUSector } from '@repo/shared-types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SCHEMA = 'tenant_acme'
const COMPANY_ID = 'co-1'
const USER_ID = 'user-1'
const CONTACT_ID = 'cnt-1'

function makeCompanyRow(overrides: Record<string, unknown> = {}) {
  return {
    id: COMPANY_ID,
    name: 'Acme Corp S.A.S',
    nit: '900123456',
    nit_dv: '8',
    tax_regime: TaxRegime.RESPONSIBLE_VAT,
    company_size: CompanySize.SMALL,
    sector_ciiu: CIIUSector.C,
    website: 'https://acme.co',
    phone: '3001234567',
    email: 'info@acme.co',
    address: 'Calle 123',
    city: 'Bogotá',
    department: 'Cundinamarca',
    municipio_code: '11001',
    tags: ['cliente'],
    assigned_to_id: null,
    custom_fields: {},
    is_active: true,
    created_by: USER_ID,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeStatsRow(overrides: Record<string, string> = {}) {
  return {
    contact_count: '2',
    active_deal_count: '1',
    total_deals_value_cents: '500000',
    invoice_count: '3',
    total_billed_cents: '1000000',
    pending_debt_cents: '200000',
    ...overrides,
  }
}

function makeContactRow(overrides: Record<string, unknown> = {}) {
  return {
    id: CONTACT_ID,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@acme.co',
    phone: '3001234567',
    status: 'new',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeDealRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'deal-1',
    title: 'Big Deal',
    value_cents: '500000',
    status: 'open',
    stage_id: 'stage-1',
    expected_close_date: null,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

// ─── Mock setup ───────────────────────────────────────────────────────────────

function buildQrMock(overrides: Record<string, jest.Mock> = {}) {
  return { query: jest.fn(), ...overrides }
}

function buildDbMock(qr: ReturnType<typeof buildQrMock>) {
  return {
    query: jest.fn((schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
    transactional: jest.fn((schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CompaniesService', () => {
  let service: CompaniesService
  let db: ReturnType<typeof buildDbMock>
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(async () => {
    qr = buildQrMock()
    db = buildDbMock(qr)

    const module = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: TenantDbService, useValue: db },
        { provide: AuditLogService, useValue: { entityEvent: jest.fn() } },
      ],
    }).compile()

    service = module.get(CompaniesService)
  })

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated companies with defaults', async () => {
      qr.query
        .mockResolvedValueOnce([{ count: '2' }])
        .mockResolvedValueOnce([makeCompanyRow(), makeCompanyRow({ id: 'co-2' })])

      const result: PaginatedCompanies = await service.findAll(SCHEMA, {})

      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(25)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]?.name).toBe('Acme Corp S.A.S')
    })

    it('applies page and limit correctly', async () => {
      qr.query.mockResolvedValueOnce([{ count: '50' }]).mockResolvedValueOnce([makeCompanyRow()])

      const result = await service.findAll(SCHEMA, { page: 3, limit: 10 })

      expect(result.page).toBe(3)
      expect(result.limit).toBe(10)
      const listQuery: string = qr.query.mock.calls[1][0] as string
      expect(listQuery).toContain('OFFSET')
    })

    it('returns empty data when no companies match', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      const result = await service.findAll(SCHEMA, { city: 'Cali' })

      expect(result.total).toBe(0)
      expect(result.data).toHaveLength(0)
    })

    it('applies full-text search filter', async () => {
      qr.query.mockResolvedValueOnce([{ count: '1' }]).mockResolvedValueOnce([makeCompanyRow()])

      await service.findAll(SCHEMA, { q: 'acme' })

      const countQuery: string = qr.query.mock.calls[0][0] as string
      expect(countQuery).toContain('plainto_tsquery')
      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain('acme')
    })

    it('applies taxRegime filter', async () => {
      qr.query.mockResolvedValueOnce([{ count: '1' }]).mockResolvedValueOnce([makeCompanyRow()])

      await service.findAll(SCHEMA, { taxRegime: TaxRegime.RESPONSIBLE_VAT })

      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain(TaxRegime.RESPONSIBLE_VAT)
    })

    it('applies companySize filter', async () => {
      qr.query.mockResolvedValueOnce([{ count: '1' }]).mockResolvedValueOnce([makeCompanyRow()])

      await service.findAll(SCHEMA, { companySize: CompanySize.SMALL })

      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain(CompanySize.SMALL)
    })

    it('applies sectorCiiu filter', async () => {
      qr.query.mockResolvedValueOnce([{ count: '1' }]).mockResolvedValueOnce([makeCompanyRow()])

      await service.findAll(SCHEMA, { sectorCiiu: CIIUSector.C })

      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain(CIIUSector.C)
    })

    it('applies city ILIKE filter', async () => {
      qr.query.mockResolvedValueOnce([{ count: '1' }]).mockResolvedValueOnce([makeCompanyRow()])

      await service.findAll(SCHEMA, { city: 'Bogot' })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('ILIKE')
      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain('%Bogot%')
    })

    it('applies tags @> filter', async () => {
      qr.query.mockResolvedValueOnce([{ count: '1' }]).mockResolvedValueOnce([makeCompanyRow()])

      await service.findAll(SCHEMA, { tags: ['cliente', 'vip'] })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('@>')
      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContainEqual(['cliente', 'vip'])
    })

    it('always includes is_active = true', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      await service.findAll(SCHEMA, {})

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('is_active = true')
    })
  })

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns a company when found', async () => {
      qr.query.mockResolvedValueOnce([makeCompanyRow()])

      const result: Company = await service.findOne(SCHEMA, COMPANY_ID)

      expect(result.id).toBe(COMPANY_ID)
      expect(result.name).toBe('Acme Corp S.A.S')
      expect(result.nitFormatted).toBe('900.123.456-8')
    })

    it('maps all fields correctly', async () => {
      qr.query.mockResolvedValueOnce([makeCompanyRow()])

      const result = await service.findOne(SCHEMA, COMPANY_ID)

      expect(result.nit).toBe('900123456')
      expect(result.nitDv).toBe('8')
      expect(result.taxRegime).toBe(TaxRegime.RESPONSIBLE_VAT)
      expect(result.companySize).toBe(CompanySize.SMALL)
      expect(result.sectorCiiu).toBe(CIIUSector.C)
      expect(result.tags).toEqual(['cliente'])
      expect(result.customFields).toEqual({})
      expect(result.isActive).toBe(true)
    })

    it('returns null for nitFormatted when nit is null', async () => {
      qr.query.mockResolvedValueOnce([makeCompanyRow({ nit: null, nit_dv: null })])

      const result = await service.findOne(SCHEMA, COMPANY_ID)

      expect(result.nitFormatted).toBeNull()
    })

    it('throws NotFoundException when company does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.findOne(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
    })

    it('throws NotFoundException for soft-deleted companies', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.findOne(SCHEMA, 'co-deleted')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    // When NIT is provided, create() calls: 1) assertNitUnique (SELECT), 2) INSERT RETURNING
    it('inserts a company and returns the mapped result', async () => {
      qr.query.mockResolvedValueOnce([]).mockResolvedValueOnce([makeCompanyRow()])

      const result = await service.create(
        SCHEMA,
        { name: 'Acme Corp S.A.S', nit: '900123456' },
        USER_ID,
      )

      expect(result.name).toBe('Acme Corp S.A.S')
      expect(result.createdById).toBe(USER_ID)
      const insertQuery: string = qr.query.mock.calls[1][0] as string
      expect(insertQuery).toContain('INSERT INTO companies')
      expect(insertQuery).toContain('RETURNING')
    })

    it('validates NIT and splits nit/nitDv correctly', async () => {
      qr.query.mockResolvedValueOnce([]).mockResolvedValueOnce([makeCompanyRow()])

      await service.create(SCHEMA, { name: 'Test', nit: '900123456' }, USER_ID)

      const params: unknown[] = qr.query.mock.calls[1][1] as unknown[]
      expect(params).toContain('900123456') // nit
      expect(params).toContain('8') // nit_dv
    })

    it('accepts formatted NIT with check digit "900.123.456-8"', async () => {
      qr.query.mockResolvedValueOnce([]).mockResolvedValueOnce([makeCompanyRow()])

      await service.create(SCHEMA, { name: 'Test', nit: '900.123.456-8' }, USER_ID)

      const params: unknown[] = qr.query.mock.calls[1][1] as unknown[]
      expect(params).toContain('900123456')
      expect(params).toContain('8')
    })

    it('accepts 10-digit NIT with embedded check digit "9001234568"', async () => {
      qr.query.mockResolvedValueOnce([]).mockResolvedValueOnce([makeCompanyRow()])

      await service.create(SCHEMA, { name: 'Test', nit: '9001234568' }, USER_ID)

      const params: unknown[] = qr.query.mock.calls[1][1] as unknown[]
      expect(params).toContain('900123456')
      expect(params).toContain('8')
    })

    it('throws ConflictException when NIT already exists', async () => {
      qr.query.mockResolvedValueOnce([{ id: 'other-co' }])

      await expect(
        service.create(SCHEMA, { name: 'Test', nit: '900123456' }, USER_ID),
      ).rejects.toThrow(ConflictException)
    })

    it('throws BadRequestException for invalid NIT', async () => {
      await expect(
        service.create(SCHEMA, { name: 'Test', nit: 'INVALID' }, USER_ID),
      ).rejects.toThrow(BadRequestException)
    })

    it('throws BadRequestException when NIT check digit is wrong', async () => {
      // "9001234567" — wrong DV (should be 8, not 7)
      await expect(
        service.create(SCHEMA, { name: 'Test', nit: '9001234567' }, USER_ID),
      ).rejects.toThrow(BadRequestException)
    })

    it('stores null nit/nitDv when nit is not provided', async () => {
      qr.query.mockResolvedValueOnce([makeCompanyRow({ nit: null, nit_dv: null })])

      await service.create(SCHEMA, { name: 'No NIT Co' }, USER_ID)

      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params[1]).toBeNull() // nit param position
      expect(params[2]).toBeNull() // nit_dv param position
    })

    it('defaults tags to empty array and customFields to empty object', async () => {
      qr.query.mockResolvedValueOnce([makeCompanyRow({ tags: [], custom_fields: {} })])

      await service.create(SCHEMA, { name: 'Test' }, USER_ID)

      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContainEqual([])
      expect(params).toContainEqual({})
    })

    it('persists customFields when provided', async () => {
      const customFields = { industry: 'tech', tier: 'gold' }
      qr.query.mockResolvedValueOnce([makeCompanyRow({ custom_fields: customFields })])

      const result = await service.create(SCHEMA, { name: 'Test', customFields }, USER_ID)

      expect(result.customFields).toEqual(customFields)
    })
  })

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates provided fields and returns updated company', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: COMPANY_ID }]) // assertCompanyExists
        .mockResolvedValueOnce([makeCompanyRow({ name: 'New Name' })]) // UPDATE RETURNING

      const result = await service.update(SCHEMA, COMPANY_ID, { name: 'New Name' })

      expect(result.name).toBe('New Name')
      const updateQuery: string = qr.query.mock.calls[1][0] as string
      expect(updateQuery).toContain('UPDATE companies')
      expect(updateQuery).toContain('name = $')
    })

    it('recalculates NIT DV when NIT is updated', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: COMPANY_ID }]) // assertCompanyExists
        .mockResolvedValueOnce([]) // assertNitUnique
        .mockResolvedValueOnce([makeCompanyRow()]) // UPDATE RETURNING

      await service.update(SCHEMA, COMPANY_ID, { nit: '900123456' })

      const updateQuery: string = qr.query.mock.calls[2][0] as string
      expect(updateQuery).toContain('nit = $')
      expect(updateQuery).toContain('nit_dv = $')
    })

    it('throws NotFoundException when company does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.update(SCHEMA, 'missing', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      )
    })

    it('updates only updated_at when no fields are provided', async () => {
      qr.query.mockResolvedValueOnce([{ id: COMPANY_ID }]).mockResolvedValueOnce([makeCompanyRow()])

      await service.update(SCHEMA, COMPANY_ID, {})

      const updateQuery: string = qr.query.mock.calls[1][0] as string
      expect(updateQuery).toContain('updated_at = NOW()')
    })
  })

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('soft-deletes by setting is_active = false', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: COMPANY_ID }]) // assertCompanyExists
        .mockResolvedValueOnce([]) // UPDATE is_active = false

      await service.remove(SCHEMA, COMPANY_ID)

      const softDeleteQuery: string = qr.query.mock.calls[1][0] as string
      expect(softDeleteQuery).toContain('is_active = false')
    })

    it('throws NotFoundException when company does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.remove(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
    })

    it('resolves to undefined on success', async () => {
      qr.query.mockResolvedValueOnce([{ id: COMPANY_ID }]).mockResolvedValueOnce([])

      await expect(service.remove(SCHEMA, COMPANY_ID)).resolves.toBeUndefined()
    })
  })

  // ─── getSummary ───────────────────────────────────────────────────────────

  describe('getSummary', () => {
    it('returns company with stats, contacts and deals', async () => {
      qr.query
        .mockResolvedValueOnce([makeCompanyRow()]) // fetchCompanyOrFail
        .mockResolvedValueOnce([makeStatsRow()]) // stats query
        .mockResolvedValueOnce([makeContactRow()]) // contacts query
        .mockResolvedValueOnce([makeDealRow()]) // deals query

      const result: CompanySummary = await service.getSummary(SCHEMA, COMPANY_ID)

      expect(result.id).toBe(COMPANY_ID)
      expect(result.stats.contactCount).toBe(2)
      expect(result.stats.activeDealCount).toBe(1)
      expect(result.stats.totalDealsValueCents).toBe(500000)
      expect(result.stats.invoiceCount).toBe(3)
      expect(result.stats.totalBilledCents).toBe(1000000)
      expect(result.stats.pendingDebtCents).toBe(200000)
      expect(result.contacts).toHaveLength(1)
      expect(result.contacts[0]?.firstName).toBe('John')
      expect(result.deals).toHaveLength(1)
      expect(result.deals[0]?.valueCents).toBe(500000)
    })

    it('maps contact fields correctly', async () => {
      qr.query
        .mockResolvedValueOnce([makeCompanyRow()])
        .mockResolvedValueOnce([makeStatsRow()])
        .mockResolvedValueOnce([makeContactRow()])
        .mockResolvedValueOnce([])

      const result = await service.getSummary(SCHEMA, COMPANY_ID)

      const contact = result.contacts[0]
      expect(contact?.id).toBe(CONTACT_ID)
      expect(contact?.firstName).toBe('John')
      expect(contact?.lastName).toBe('Doe')
      expect(contact?.email).toBe('john@acme.co')
      expect(contact?.status).toBe('new')
    })

    it('maps deal fields correctly', async () => {
      qr.query
        .mockResolvedValueOnce([makeCompanyRow()])
        .mockResolvedValueOnce([makeStatsRow()])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([makeDealRow()])

      const result = await service.getSummary(SCHEMA, COMPANY_ID)

      const deal = result.deals[0]
      expect(deal?.id).toBe('deal-1')
      expect(deal?.title).toBe('Big Deal')
      expect(deal?.valueCents).toBe(500000)
      expect(deal?.status).toBe('open')
      expect(deal?.stageId).toBe('stage-1')
    })

    it('returns zeros when company has no activity', async () => {
      qr.query
        .mockResolvedValueOnce([makeCompanyRow()])
        .mockResolvedValueOnce([
          makeStatsRow({
            contact_count: '0',
            active_deal_count: '0',
            total_deals_value_cents: '0',
            invoice_count: '0',
            total_billed_cents: '0',
            pending_debt_cents: '0',
          }),
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await service.getSummary(SCHEMA, COMPANY_ID)

      expect(result.stats.contactCount).toBe(0)
      expect(result.stats.activeDealCount).toBe(0)
      expect(result.contacts).toHaveLength(0)
      expect(result.deals).toHaveLength(0)
    })

    it('throws NotFoundException when company does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.getSummary(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── assignContact ────────────────────────────────────────────────────────

  describe('assignContact', () => {
    it('updates contact company_id and resolves', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: COMPANY_ID }]) // assertCompanyExists
        .mockResolvedValueOnce([{ id: CONTACT_ID }]) // UPDATE contacts

      await expect(service.assignContact(SCHEMA, COMPANY_ID, CONTACT_ID)).resolves.toBeUndefined()

      const updateQuery: string = qr.query.mock.calls[1][0] as string
      expect(updateQuery).toContain('company_id = $')
    })

    it('throws NotFoundException when company does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.assignContact(SCHEMA, 'missing', CONTACT_ID)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('throws NotFoundException when contact is not found or already inactive', async () => {
      qr.query.mockResolvedValueOnce([{ id: COMPANY_ID }]).mockResolvedValueOnce([]) // contact not found

      await expect(service.assignContact(SCHEMA, COMPANY_ID, 'missing-contact')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // ─── removeContact ────────────────────────────────────────────────────────

  describe('removeContact', () => {
    it('sets company_id to NULL and resolves', async () => {
      qr.query.mockResolvedValueOnce([{ id: CONTACT_ID }])

      await expect(service.removeContact(SCHEMA, COMPANY_ID, CONTACT_ID)).resolves.toBeUndefined()

      const updateQuery: string = qr.query.mock.calls[0][0] as string
      expect(updateQuery).toContain('company_id = NULL')
    })

    it('throws NotFoundException when contact is not assigned to this company', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.removeContact(SCHEMA, COMPANY_ID, 'other-contact')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
