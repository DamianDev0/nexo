import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { buildDbMock, buildQrMock } from '@/shared/testing/tenant-db.mock'
import { ContactViewsService } from '../services/contact-views.service'
import { ContactViewsRepository } from '../repositories/contact-views.repository'
import type { ContactViewRow } from '../interfaces/contact-view-row.interfaces'

const SCHEMA = 'tenant_test'
const OWNER = 'a67c2f4e-1111-4f2c-b6d8-e4a67c056f01'
const OTHER = 'a67c2f4e-2222-4f2c-b6d8-e4a67c056f02'

function makeViewRow(overrides: Partial<ContactViewRow> = {}): ContactViewRow {
  return {
    id: 'a67c2f4e-3333-4f2c-b6d8-e4a67c056f03',
    owner_id: OWNER,
    name: 'My leads',
    description: null,
    filters: { status: 'new' },
    advanced_filters: null,
    columns: { hidden: ['city'] },
    sort: { field: 'createdAt', direction: 'desc' },
    density: 'comfortable',
    is_default: false,
    is_favorite: false,
    visibility: 'private',
    position: 0,
    created_at: '2026-07-31T00:00:00Z',
    updated_at: '2026-07-31T00:00:00Z',
    ...overrides,
  }
}

describe('ContactViewsService', () => {
  let service: ContactViewsService
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(async () => {
    qr = buildQrMock()
    const module = await Test.createTestingModule({
      providers: [
        ContactViewsService,
        ContactViewsRepository,
        { provide: TenantDbService, useValue: buildDbMock(qr) },
      ],
    }).compile()
    service = module.get(ContactViewsService)
  })

  it('lists own views plus shared ones ordered by position', async () => {
    qr.query.mockResolvedValueOnce([makeViewRow()])

    const views = await service.findAll(SCHEMA, OWNER)

    const [sql, params] = qr.query.mock.calls[0] as [string, unknown[]]
    expect(sql).toContain(`owner_id = $1 OR visibility = 'shared'`)
    expect(sql).toContain('ORDER BY position ASC')
    expect(params).toEqual([OWNER])
    expect(views[0]?.columns).toEqual({ hidden: ['city'] })
  })

  it('clears the previous default before creating a new default view', async () => {
    qr.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ next: 3 }])
      .mockResolvedValueOnce([makeViewRow({ is_default: true, position: 3 })])

    const view = await service.create(SCHEMA, OWNER, { name: 'Default', isDefault: true })

    const [clearSql] = qr.query.mock.calls[0] as [string]
    expect(clearSql).toContain('SET is_default = false')
    expect(view.position).toBe(3)
    expect(view.isDefault).toBe(true)
  })

  it('rejects updates from a user that does not own the view', async () => {
    qr.query.mockResolvedValueOnce([makeViewRow({ owner_id: OTHER })])

    await expect(service.update(SCHEMA, OWNER, makeViewRow().id, { name: 'x' })).rejects.toThrow(
      ForbiddenException,
    )
  })

  it('duplicates a shared view as a private copy', async () => {
    qr.query
      .mockResolvedValueOnce([makeViewRow({ owner_id: OTHER, visibility: 'shared' })])
      .mockResolvedValueOnce([{ next: 1 }])
      .mockResolvedValueOnce([
        makeViewRow({ owner_id: OWNER, name: 'My leads (copy)', visibility: 'private' }),
      ])

    const copy = await service.duplicate(SCHEMA, OWNER, makeViewRow().id, {})

    const [insertSql, insertParams] = qr.query.mock.calls[2] as [string, unknown[]]
    expect(insertSql).toContain(`false, false, 'private'`)
    expect(insertParams[1]).toBe('My leads (copy)')
    expect(copy.visibility).toBe('private')
  })

  it('writes one position per id on reorder scoped to the owner', async () => {
    qr.query.mockResolvedValue([])
    const ids = ['a67c2f4e-4444-4f2c-b6d8-e4a67c056f04', 'a67c2f4e-5555-4f2c-b6d8-e4a67c056f05']

    await service.reorder(SCHEMA, OWNER, { ids })

    expect(qr.query).toHaveBeenCalledTimes(2)
    const [sql, params] = qr.query.mock.calls[1] as [string, unknown[]]
    expect(sql).toContain('owner_id = $2')
    expect(params).toEqual([ids[1], OWNER, 1])
  })

  it('throws when deleting a view the user does not own', async () => {
    qr.query.mockResolvedValueOnce([])

    await expect(service.remove(SCHEMA, OWNER, makeViewRow().id)).rejects.toThrow(NotFoundException)
  })
})
