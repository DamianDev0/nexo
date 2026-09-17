import { Test } from '@nestjs/testing'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { buildDbMock, buildQrMock } from '@/shared/testing/tenant-db.mock'
import type { FieldDef, ObjectView } from '@repo/shared-types'
import type { ObjectTableDefinition } from '../interfaces/object-definition.interfaces'
import { ObjectWorkspaceRepository } from '../repositories/object-workspace.repository'
import { ObjectViewsService } from '../services/object-views.service'
import { ObjectWorkspaceService } from '../services/object-workspace.service'

const SCHEMA = 'tenant_acme'
const USER = 'user-1'
const DEF: ObjectTableDefinition = {
  type: 'contact',
  columns: [
    {
      key: 'name',
      labelKey: 'contacts.columns.name',
      hintKey: '',
      sortField: 'firstName',
      defaultVisible: true,
      defaultWidth: 240,
      minWidth: 180,
    },
    {
      key: 'email',
      labelKey: 'contacts.columns.email',
      hintKey: '',
      sortField: 'email',
      defaultVisible: true,
      defaultWidth: 210,
      minWidth: 160,
    },
    {
      key: 'city',
      labelKey: 'contacts.columns.city',
      hintKey: '',
      sortField: 'city',
      defaultVisible: true,
      defaultWidth: 130,
      minWidth: 100,
    },
  ],
}

function makeView(overrides: Partial<ObjectView> = {}): ObjectView {
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

describe('ObjectWorkspaceService', () => {
  let service: ObjectWorkspaceService
  let db: ReturnType<typeof buildDbMock>
  let qr: ReturnType<typeof buildQrMock>
  let views: { findAll: jest.Mock }

  beforeEach(async () => {
    qr = buildQrMock()
    db = buildDbMock(qr)
    views = { findAll: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        ObjectWorkspaceService,
        ObjectWorkspaceRepository,
        { provide: TenantDbService, useValue: db },
        { provide: ObjectViewsService, useValue: views },
      ],
    }).compile()

    service = module.get(ObjectWorkspaceService)
  })

  describe('getWorkspace', () => {
    it('composes views and the column catalog followed by custom field columns', async () => {
      views.findAll.mockResolvedValue([makeView()])
      qr.query.mockResolvedValueOnce([])
      const eps = { key: 'eps', label: 'EPS', type: 'text' } as FieldDef

      const workspace = await service.getWorkspace(SCHEMA, DEF, USER, [eps])

      expect(workspace.views).toHaveLength(1)
      expect(workspace.columns.map((column) => column.key)).toEqual([
        'name',
        'email',
        'city',
        'custom:eps',
      ])
      expect(workspace.columns[3]).toMatchObject({ custom: true, label: 'EPS', sortField: null })
    })

    it('reads the saved state of the requested object type only', async () => {
      views.findAll.mockResolvedValue([])
      qr.query.mockResolvedValueOnce([])

      await service.getWorkspace(SCHEMA, { ...DEF, type: 'company' }, USER)

      const [sql, params] = qr.query.mock.calls[0] as [string, unknown[]]
      expect(sql).toContain('user_id = $1 AND object_type = $2')
      expect(params).toEqual([USER, 'company'])
    })

    it('falls back to the default view when there is no saved state', async () => {
      views.findAll.mockResolvedValue([makeView({ id: 'view-default', isDefault: true })])
      qr.query.mockResolvedValueOnce([])

      const workspace = await service.getWorkspace(SCHEMA, DEF, USER)

      expect(workspace.activeViewId).toBe('view-default')
      expect(workspace.tableState).toEqual({})
    })

    it('uses the saved active view when it still exists', async () => {
      views.findAll.mockResolvedValue([
        makeView({ id: 'view-default', isDefault: true }),
        makeView({ id: 'view-saved' }),
      ])
      qr.query.mockResolvedValueOnce([
        { active_view_id: 'view-saved', table_state: { density: 'compact' } },
      ])

      const workspace = await service.getWorkspace(SCHEMA, DEF, USER)

      expect(workspace.activeViewId).toBe('view-saved')
      expect(workspace.tableState).toEqual({ density: 'compact' })
    })

    it('falls back to the default view when the saved active_view_id no longer exists', async () => {
      views.findAll.mockResolvedValue([makeView({ id: 'view-default', isDefault: true })])
      qr.query.mockResolvedValueOnce([
        { active_view_id: 'view-deleted', table_state: { density: 'compact' } },
      ])

      const workspace = await service.getWorkspace(SCHEMA, DEF, USER)

      expect(workspace.activeViewId).toBe('view-default')
    })

    it('falls back to null when the saved view is gone and there is no default', async () => {
      views.findAll.mockResolvedValue([makeView({ id: 'view-other', ownerId: 'someone-else' })])
      qr.query.mockResolvedValueOnce([{ active_view_id: 'view-deleted', table_state: {} }])

      const workspace = await service.getWorkspace(SCHEMA, DEF, USER)

      expect(workspace.activeViewId).toBeNull()
    })

    it('only considers a default view owned by the requesting user', async () => {
      views.findAll.mockResolvedValue([
        makeView({ id: 'view-other-default', ownerId: 'someone-else', isDefault: true }),
      ])
      qr.query.mockResolvedValueOnce([])

      const workspace = await service.getWorkspace(SCHEMA, DEF, USER)

      expect(workspace.activeViewId).toBeNull()
    })
  })

  describe('updateState', () => {
    function mockState(existing: unknown[]) {
      qr.query.mockResolvedValueOnce([]).mockResolvedValueOnce(existing).mockResolvedValueOnce([])
    }

    function upsertCall(): [string, unknown[]] {
      return qr.query.mock.calls[2] as [string, unknown[]]
    }

    it('serializes writers per user inside one transaction before reading the state', async () => {
      mockState([])

      await service.updateState(SCHEMA, DEF, USER, { activeViewId: 'view-1' })

      expect(db.transactional).toHaveBeenCalledTimes(1)
      const [lockSql, lockParams] = qr.query.mock.calls[0] as [string, unknown[]]
      expect(lockSql).toContain('pg_advisory_xact_lock')
      expect(lockParams).toEqual(['contact', USER])
    })

    it('upserts active view and table state with an ON CONFLICT clause', async () => {
      mockState([])

      await service.updateState(SCHEMA, DEF, USER, {
        activeViewId: 'view-1',
        tableState: { density: 'compact' },
      })

      const [sql, params] = upsertCall()
      expect(sql).toContain('INSERT INTO object_workspace_states')
      expect(sql).toContain('ON CONFLICT (user_id, object_type) DO UPDATE')
      expect(params).toEqual(['contact', USER, 'view-1', { density: 'compact' }])
    })

    it('keeps the existing active view and table state when the dto omits them', async () => {
      mockState([{ active_view_id: 'view-existing', table_state: { density: 'comfortable' } }])

      await service.updateState(SCHEMA, DEF, USER, {})

      const [, params] = upsertCall()
      expect(params).toEqual(['contact', USER, 'view-existing', { density: 'comfortable' }])
    })

    it('falls back to null active view when there is no prior state and none is provided', async () => {
      mockState([])

      await service.updateState(SCHEMA, DEF, USER, { tableState: { density: 'compact' } })

      const [, params] = upsertCall()
      expect(params).toEqual(['contact', USER, null, { density: 'compact' }])
    })

    it('merges the incoming table state into the stored one instead of replacing it', async () => {
      mockState([
        {
          active_view_id: null,
          table_state: { density: 'compact', columns: { order: ['name', 'email'] } },
        },
      ])

      await service.updateState(SCHEMA, DEF, USER, {
        tableState: { columns: { widths: { name: 200 } } },
      })

      const [, params] = upsertCall()
      expect(params[3]).toEqual({
        density: 'compact',
        columns: { order: ['name', 'email'], widths: { name: 200 } },
      })
    })

    it('clamps persisted widths to the catalog bounds', async () => {
      mockState([])

      await service.updateState(SCHEMA, DEF, USER, {
        tableState: { columns: { widths: { name: 5, city: 10_000, 'custom:eps': 1 } } },
      })

      const [, params] = upsertCall()
      expect(params[3]).toEqual({
        columns: { widths: { name: 180, city: 480, 'custom:eps': 100 } },
      })
    })

    it('clears the active view when the dto sends an explicit null', async () => {
      mockState([{ active_view_id: 'view-existing', table_state: { density: 'comfortable' } }])

      await service.updateState(SCHEMA, DEF, USER, { activeViewId: null })

      const [, params] = upsertCall()
      expect(params).toEqual(['contact', USER, null, { density: 'comfortable' }])
    })
  })
})
