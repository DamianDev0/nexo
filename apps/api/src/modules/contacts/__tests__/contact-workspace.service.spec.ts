import { Test } from '@nestjs/testing'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { buildDbMock, buildQrMock } from '@/shared/testing/tenant-db.mock'
import { ContactWorkspaceService } from '../services/contact-workspace.service'
import { ContactWorkspaceRepository } from '../repositories/contact-workspace.repository'
import { ContactViewsService } from '../services/contact-views.service'
import { ContactsService } from '../services/contacts.service'
import type { ContactView } from '@repo/shared-types'

const SCHEMA = 'tenant_acme'
const USER = 'user-1'

function makeView(overrides: Partial<ContactView> = {}): ContactView {
  return {
    id: 'view-1',
    ownerId: USER,
    name: 'My leads',
    description: null,
    filters: {},
    advancedFilters: null,
    columns: {},
    sort: null,
    density: 'comfortable',
    isDefault: false,
    isFavorite: false,
    visibility: 'private',
    position: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('ContactWorkspaceService', () => {
  let service: ContactWorkspaceService
  let db: ReturnType<typeof buildDbMock>
  let qr: ReturnType<typeof buildQrMock>
  let views: { findAll: jest.Mock }
  let contacts: { counts: jest.Mock }

  beforeEach(async () => {
    qr = buildQrMock()
    db = buildDbMock(qr)
    views = { findAll: jest.fn() }
    contacts = { counts: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        ContactWorkspaceService,
        ContactWorkspaceRepository,
        { provide: TenantDbService, useValue: db },
        { provide: ContactViewsService, useValue: views },
        { provide: ContactsService, useValue: contacts },
      ],
    }).compile()

    service = module.get(ContactWorkspaceService)
  })

  describe('getWorkspace', () => {
    it('composes views, counts, column catalog and quick filters', async () => {
      views.findAll.mockResolvedValue([makeView()])
      contacts.counts.mockResolvedValue({ total: 3, byStatus: { new: 3 } })
      qr.query.mockResolvedValueOnce([])

      const workspace = await service.getWorkspace(SCHEMA, USER)

      expect(workspace.views).toHaveLength(1)
      expect(workspace.counts).toEqual({ total: 3, byStatus: { new: 3 } })
      expect(workspace.columns.length).toBeGreaterThan(0)
      expect(workspace.quickFilters.statuses.length).toBeGreaterThan(0)
      expect(workspace.quickFilters.sources.length).toBeGreaterThan(0)
      expect(workspace.quickFilters.lifecycleStages.length).toBeGreaterThan(0)
    })

    it('falls back to the default view when there is no saved state', async () => {
      views.findAll.mockResolvedValue([makeView({ id: 'view-default', isDefault: true })])
      contacts.counts.mockResolvedValue({ total: 0, byStatus: {} })
      qr.query.mockResolvedValueOnce([])

      const workspace = await service.getWorkspace(SCHEMA, USER)

      expect(workspace.activeViewId).toBe('view-default')
      expect(workspace.tableState).toEqual({})
    })

    it('uses the saved active view when it still exists', async () => {
      views.findAll.mockResolvedValue([
        makeView({ id: 'view-default', isDefault: true }),
        makeView({ id: 'view-saved' }),
      ])
      contacts.counts.mockResolvedValue({ total: 0, byStatus: {} })
      qr.query.mockResolvedValueOnce([
        { active_view_id: 'view-saved', table_state: { density: 'compact' } },
      ])

      const workspace = await service.getWorkspace(SCHEMA, USER)

      expect(workspace.activeViewId).toBe('view-saved')
      expect(workspace.tableState).toEqual({ density: 'compact' })
    })

    it('falls back to the default view when the saved active_view_id no longer exists', async () => {
      views.findAll.mockResolvedValue([makeView({ id: 'view-default', isDefault: true })])
      contacts.counts.mockResolvedValue({ total: 0, byStatus: {} })
      qr.query.mockResolvedValueOnce([
        { active_view_id: 'view-deleted', table_state: { density: 'compact' } },
      ])

      const workspace = await service.getWorkspace(SCHEMA, USER)

      expect(workspace.activeViewId).toBe('view-default')
    })

    it('falls back to null when the saved view is gone and there is no default', async () => {
      views.findAll.mockResolvedValue([makeView({ id: 'view-other', ownerId: 'someone-else' })])
      contacts.counts.mockResolvedValue({ total: 0, byStatus: {} })
      qr.query.mockResolvedValueOnce([{ active_view_id: 'view-deleted', table_state: {} }])

      const workspace = await service.getWorkspace(SCHEMA, USER)

      expect(workspace.activeViewId).toBeNull()
    })

    it('only considers a default view owned by the requesting user', async () => {
      views.findAll.mockResolvedValue([
        makeView({ id: 'view-other-default', ownerId: 'someone-else', isDefault: true }),
      ])
      contacts.counts.mockResolvedValue({ total: 0, byStatus: {} })
      qr.query.mockResolvedValueOnce([])

      const workspace = await service.getWorkspace(SCHEMA, USER)

      expect(workspace.activeViewId).toBeNull()
    })
  })

  describe('updateState', () => {
    it('upserts active view and table state with an ON CONFLICT clause', async () => {
      qr.query.mockResolvedValueOnce([]).mockResolvedValueOnce([])

      await service.updateState(SCHEMA, USER, {
        activeViewId: 'view-1',
        tableState: { density: 'compact' },
      })

      const [sql, params] = qr.query.mock.calls[1] as [string, unknown[]]
      expect(sql).toContain('INSERT INTO contact_workspace_states')
      expect(sql).toContain('ON CONFLICT (user_id) DO UPDATE')
      expect(params).toEqual([USER, 'view-1', { density: 'compact' }])
    })

    it('keeps the existing active view and table state when the dto omits them', async () => {
      qr.query
        .mockResolvedValueOnce([
          { active_view_id: 'view-existing', table_state: { density: 'comfortable' } },
        ])
        .mockResolvedValueOnce([])

      await service.updateState(SCHEMA, USER, {})

      const [, params] = qr.query.mock.calls[1] as [string, unknown[]]
      expect(params).toEqual([USER, 'view-existing', { density: 'comfortable' }])
    })

    it('falls back to null active view when there is no prior state and none is provided', async () => {
      qr.query.mockResolvedValueOnce([]).mockResolvedValueOnce([])

      await service.updateState(SCHEMA, USER, { tableState: { density: 'compact' } })

      const [, params] = qr.query.mock.calls[1] as [string, unknown[]]
      expect(params).toEqual([USER, null, { density: 'compact' }])
    })

    it('merges the incoming table state into the stored one instead of replacing it', async () => {
      qr.query
        .mockResolvedValueOnce([
          {
            active_view_id: null,
            table_state: { density: 'compact', columns: { order: ['name', 'email'] } },
          },
        ])
        .mockResolvedValueOnce([])

      await service.updateState(SCHEMA, USER, {
        tableState: { columns: { widths: { name: 200 } } },
      })

      const [, params] = qr.query.mock.calls[1] as [string, unknown[]]
      expect(params[2]).toEqual({
        density: 'compact',
        columns: { order: ['name', 'email'], widths: { name: 200 } },
      })
    })

    it('clamps persisted widths to the catalog bounds', async () => {
      qr.query.mockResolvedValueOnce([]).mockResolvedValueOnce([])

      await service.updateState(SCHEMA, USER, {
        tableState: { columns: { widths: { name: 5, city: 10_000 } } },
      })

      const [, params] = qr.query.mock.calls[1] as [string, unknown[]]
      expect(params[2]).toEqual({ columns: { widths: { name: 180, city: 480 } } })
    })

    it('clears the active view when the dto sends an explicit null', async () => {
      qr.query
        .mockResolvedValueOnce([
          { active_view_id: 'view-existing', table_state: { density: 'comfortable' } },
        ])
        .mockResolvedValueOnce([])

      await service.updateState(SCHEMA, USER, { activeViewId: null })

      const [, params] = qr.query.mock.calls[1] as [string, unknown[]]
      expect(params).toEqual([USER, null, { density: 'comfortable' }])
    })
  })
})
