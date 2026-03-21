import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { NotificationsService } from '../notifications.service'
import { TenantDbService } from '@/shared/database/tenant-db.service'

const SCHEMA = 'tenant_acme'
const USER_ID = 'user-1'
const NOTIF_ID = 'notif-1'

function makeNotificationRow(overrides: Record<string, unknown> = {}) {
  return {
    id: NOTIF_ID,
    user_id: USER_ID,
    notification_type: 'deal.won',
    title: 'Deal won!',
    body: 'Big Deal was marked as won',
    entity_type: 'deal',
    entity_id: 'deal-1',
    is_read: false,
    read_at: null,
    created_at: '2026-03-20T00:00:00Z',
    ...overrides,
  }
}

function makePreferencesRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pref-1',
    user_id: USER_ID,
    in_app: true,
    email: true,
    push: false,
    muted_types: [],
    created_at: '2026-03-20T00:00:00Z',
    updated_at: '2026-03-20T00:00:00Z',
    ...overrides,
  }
}

function buildQrMock() {
  return { query: jest.fn() }
}

function buildDbMock(qr: ReturnType<typeof buildQrMock>) {
  return {
    query: jest.fn((_schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
  }
}

describe('NotificationsService', () => {
  let service: NotificationsService
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(async () => {
    qr = buildQrMock()
    const db = buildDbMock(qr)

    const module = await Test.createTestingModule({
      providers: [NotificationsService, { provide: TenantDbService, useValue: db }],
    }).compile()

    service = module.get(NotificationsService)
  })

  describe('findAll', () => {
    it('returns paginated notifications with unread count', async () => {
      qr.query
        .mockResolvedValueOnce([{ count: '5' }])
        .mockResolvedValueOnce([{ count: '3' }])
        .mockResolvedValueOnce([makeNotificationRow(), makeNotificationRow({ id: 'notif-2' })])

      const result = await service.findAll(SCHEMA, USER_ID, {})

      expect(result.total).toBe(5)
      expect(result.unreadCount).toBe(3)
      expect(result.data).toHaveLength(2)
    })

    it('filters by unread only', async () => {
      qr.query
        .mockResolvedValueOnce([{ count: '0' }])
        .mockResolvedValueOnce([{ count: '0' }])
        .mockResolvedValueOnce([])

      await service.findAll(SCHEMA, USER_ID, { unread: 'true' })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('is_read = false')
    })
  })

  describe('getUnreadCount', () => {
    it('returns unread count', async () => {
      qr.query.mockResolvedValueOnce([{ count: '7' }])

      const result = await service.getUnreadCount(SCHEMA, USER_ID)

      expect(result).toBe(7)
    })
  })

  describe('markAsRead', () => {
    it('marks notification as read', async () => {
      qr.query.mockResolvedValueOnce([{ id: NOTIF_ID }])

      await expect(service.markAsRead(SCHEMA, NOTIF_ID, USER_ID)).resolves.toBeUndefined()
    })

    it('throws NotFoundException if not found', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.markAsRead(SCHEMA, 'missing', USER_ID)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('markAllAsRead', () => {
    it('marks all as read and returns count', async () => {
      qr.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ count: '5' }])

      const result = await service.markAllAsRead(SCHEMA, USER_ID)

      expect(result.updated).toBe(5)
    })
  })

  describe('send', () => {
    it('creates notification and returns it', async () => {
      qr.query
        .mockResolvedValueOnce([makePreferencesRow()])
        .mockResolvedValueOnce([makeNotificationRow()])

      const result = await service.send(SCHEMA, USER_ID, {
        type: 'deal.won',
        title: 'Deal won!',
        body: 'Big Deal was marked as won',
        entityType: 'deal',
        entityId: 'deal-1',
      })

      expect(result.title).toBe('Deal won!')
      expect(result.notificationType).toBe('deal.won')
    })

    it('respects muted types', async () => {
      qr.query.mockResolvedValueOnce([makePreferencesRow({ muted_types: ['deal.won'] })])

      const result = await service.send(SCHEMA, USER_ID, {
        type: 'deal.won',
        title: 'Should be muted',
      })

      expect(qr.query).toHaveBeenCalledTimes(1)
      expect(result.id).toBeUndefined()
    })
  })

  describe('getPreferences', () => {
    it('returns user preferences', async () => {
      qr.query.mockResolvedValueOnce([makePreferencesRow()])

      const result = await service.getPreferences(SCHEMA, USER_ID)

      expect(result.inApp).toBe(true)
      expect(result.email).toBe(true)
      expect(result.push).toBe(false)
    })

    it('creates default preferences if none exist', async () => {
      qr.query.mockResolvedValueOnce([]).mockResolvedValueOnce([makePreferencesRow()])

      const result = await service.getPreferences(SCHEMA, USER_ID)

      expect(result.inApp).toBe(true)
    })
  })

  describe('updatePreferences', () => {
    it('updates and returns preferences', async () => {
      qr.query
        .mockResolvedValueOnce([makePreferencesRow()])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([makePreferencesRow({ email: false, muted_types: ['stock.low'] })])

      const result = await service.updatePreferences(SCHEMA, USER_ID, {
        email: false,
        mutedTypes: ['stock.low'],
      })

      expect(result.email).toBe(false)
      expect(result.mutedTypes).toEqual(['stock.low'])
    })
  })
})
