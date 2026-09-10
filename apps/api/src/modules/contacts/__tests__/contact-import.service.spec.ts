import { Test } from '@nestjs/testing'
import { ImportService } from '@/shared/imports/services/import.service'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { buildDbMock, buildQrMock } from '@/shared/testing/tenant-db.mock'
import { ContactImportService } from '../services/contact-import.service'
import { ContactsRepository } from '../repositories/contacts.repository'

const SCHEMA = 'tenant_acme'
const FILE_ID = 'file-1'
const USER = 'user-1'

type RowError = { field: string; message: string; value?: string }
type Row = { data: Record<string, unknown>; errors: RowError[] }

function row(data: Record<string, unknown>, errors: RowError[] = []): Row {
  return { data, errors }
}

describe('ContactImportService', () => {
  let service: ContactImportService
  let qr: ReturnType<typeof buildQrMock>
  let repository: {
    findEnabledTagNames: jest.Mock
    findImportMatchId: jest.Mock
    insert: jest.Mock
    updateById: jest.Mock
  }
  let importService: { analyze: jest.Mock; getRowsForExecution: jest.Mock; release: jest.Mock }

  async function execute(rows: Row[], strategy: 'skip' | 'create' | 'update' = 'skip') {
    importService.getRowsForExecution.mockResolvedValue({ rows, cleanup: jest.fn() })
    return service.execute(SCHEMA, FILE_ID, {}, strategy, USER)
  }

  async function validate(rows: Row[]) {
    importService.getRowsForExecution.mockResolvedValue({ rows, cleanup: jest.fn() })
    return service.validate(SCHEMA, FILE_ID, {})
  }

  beforeEach(async () => {
    qr = buildQrMock()
    repository = {
      findEnabledTagNames: jest.fn().mockResolvedValue(['VIP', 'Frío']),
      findImportMatchId: jest.fn().mockResolvedValue(null),
      insert: jest.fn().mockResolvedValue({ id: 'c-1' }),
      updateById: jest.fn().mockResolvedValue({ id: 'c-1' }),
    }
    importService = { analyze: jest.fn(), getRowsForExecution: jest.fn(), release: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        ContactImportService,
        { provide: TenantDbService, useValue: buildDbMock(qr) },
        { provide: ContactsRepository, useValue: repository },
        { provide: ImportService, useValue: importService },
      ],
    }).compile()

    service = module.get(ContactImportService)
  })

  it('imports a clean row and always releases the uploaded file', async () => {
    const result = await execute([row({ firstName: 'Ana', email: 'ana@empresa.co' })])

    expect(result).toEqual({ imported: 1, updated: 0, skipped: 0, errors: [] })
    expect(importService.release).toHaveBeenCalledWith(FILE_ID, SCHEMA)
  })

  it('releases the uploaded file even when the import blows up', async () => {
    importService.getRowsForExecution.mockResolvedValue({
      rows: [row({ firstName: 'Ana' })],
      cleanup: jest.fn(),
    })
    repository.findEnabledTagNames.mockRejectedValue(new Error('db down'))

    await expect(service.execute(SCHEMA, FILE_ID, {}, 'skip', USER)).rejects.toThrow('db down')
    expect(importService.release).toHaveBeenCalledWith(FILE_ID, SCHEMA)
  })

  it('keeps the file after validating so the user can still import it', async () => {
    await validate([row({ firstName: 'Ana' })])

    expect(importService.release).not.toHaveBeenCalled()
  })

  it('skips a row the parser already flagged and reports its line number', async () => {
    const result = await execute([
      row({ firstName: 'Ana' }),
      row({ firstName: 'Beto' }, [{ field: 'email', message: 'Invalid email address' }]),
    ])

    expect(result.imported).toBe(1)
    expect(result.skipped).toBe(1)
    expect(result.errors).toEqual([{ row: 3, message: 'Invalid email address' }])
  })

  it('skips a row without a first name', async () => {
    const result = await execute([row({ email: 'ana@empresa.co' })])

    expect(result.imported).toBe(0)
    expect(result.errors[0]?.message).toBe('First name is required')
  })

  it('skips a row whose document number does not match its type', async () => {
    const result = await execute([
      row({ firstName: 'Ana', documentType: 'cc', documentNumber: 'ABC' }),
    ])

    expect(result.imported).toBe(0)
    expect(result.skipped).toBe(1)
  })

  describe('validate', () => {
    it('counts ready, warning and error rows across the whole file', async () => {
      const report = await validate([
        row({ firstName: 'Ana', email: 'ana@empresa.co' }),
        row({ firstName: 'Beto', tags: ['vip', 'fantasma'] }),
        row({ email: 'sin-nombre@empresa.co' }),
        row({ firstName: 'Caro' }, [{ field: 'email', message: 'Invalid email address' }]),
      ])

      expect(report).toMatchObject({
        totalRows: 4,
        readyRows: 2,
        warningRows: 1,
        errorRows: 2,
        truncatedIssues: false,
      })
    })

    it('reports each problem with its row, severity and offending value', async () => {
      const report = await validate([row({ firstName: 'Beto', tags: ['fantasma'] })])

      expect(report.issues).toEqual([
        {
          row: 2,
          severity: 'warning',
          field: 'tags',
          message: 'Tags that are not in the catalog will be ignored',
          value: 'fantasma',
        },
      ])
    })

    it('counts a warning row as ready, because it still imports', async () => {
      const report = await validate([row({ firstName: 'Beto', tags: ['fantasma'] })])

      expect(report.readyRows).toBe(1)
      expect(report.warningRows).toBe(1)
    })
  })

  it('keeps only catalog tags, canonicalizes their case and reports the rest', async () => {
    const result = await execute([row({ firstName: 'Ana', tags: ['vip', 'fantasma'] })])

    expect(repository.insert).toHaveBeenCalledWith(qr, expect.objectContaining({ tags: ['VIP'] }))
    expect(result.imported).toBe(1)
    expect(result.errors[0]?.message).toContain('fantasma')
  })

  it('defaults the source to import so the rows are traceable', async () => {
    await execute([row({ firstName: 'Ana' })])

    expect(repository.insert).toHaveBeenCalledWith(
      qr,
      expect.objectContaining({ source: 'import', status: 'new', createdBy: USER }),
    )
  })

  describe('duplicates', () => {
    beforeEach(() => repository.findImportMatchId.mockResolvedValue('existing-1'))

    it('skips the existing contact under the skip strategy', async () => {
      const result = await execute([row({ firstName: 'Ana', email: 'ana@empresa.co' })], 'skip')

      expect(result).toMatchObject({ imported: 0, updated: 0, skipped: 1 })
      expect(repository.insert).not.toHaveBeenCalled()
    })

    it('updates the existing contact under the update strategy', async () => {
      const result = await execute([row({ firstName: 'Ana', email: 'ana@empresa.co' })], 'update')

      expect(result).toMatchObject({ imported: 0, updated: 1, skipped: 0 })
      expect(repository.updateById).toHaveBeenCalledWith(qr, 'existing-1', expect.any(Array))
    })

    it('inserts a second contact under the create strategy', async () => {
      const result = await execute([row({ firstName: 'Ana', email: 'ana@empresa.co' })], 'create')

      expect(result).toMatchObject({ imported: 1, updated: 0, skipped: 0 })
      expect(repository.insert).toHaveBeenCalled()
    })

    it('never writes a null over an existing value when updating', async () => {
      await execute([row({ firstName: 'Ana', email: 'ana@empresa.co' })], 'update')

      const changes = repository.updateById.mock.calls[0]?.[2] as Array<{
        column: string
        value: unknown
      }>
      expect(changes.every((change) => change.value !== null)).toBe(true)
      expect(changes.map((change) => change.column)).toContain('first_name')
      expect(changes.map((change) => change.column)).not.toContain('job_title')
    })
  })
})
