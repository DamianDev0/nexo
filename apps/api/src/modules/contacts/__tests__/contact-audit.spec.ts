import {
  AUDIT_EVENTS,
  AuditAction,
  AuditEntityEvent,
  AuditEntityType,
} from '@/shared/events/audit.events'
import { emitContactAudit } from '../services/contact-audit'

describe('emitContactAudit', () => {
  it('emits AUDIT_EVENTS.ENTITY with an AuditEntityEvent carrying the given fields', () => {
    const eventBus = { emit: jest.fn() }

    emitContactAudit(eventBus, {
      schemaName: 'tenant_acme',
      action: AuditAction.ContactUpdated,
      entityId: 'c-1',
      userId: 'user-1',
      description: 'Contact c-1 updated',
    })

    expect(eventBus.emit).toHaveBeenCalledWith(AUDIT_EVENTS.ENTITY, expect.any(AuditEntityEvent))
    const event = eventBus.emit.mock.calls[0][1] as AuditEntityEvent
    expect(event.schemaName).toBe('tenant_acme')
    expect(event.action).toBe(AuditAction.ContactUpdated)
    expect(event.entityType).toBe(AuditEntityType.Contact)
    expect(event.entityId).toBe('c-1')
    expect(event.userId).toBe('user-1')
    expect(event.description).toBe('Contact c-1 updated')
  })

  it('carries an undefined userId through when the action has no actor', () => {
    const eventBus = { emit: jest.fn() }

    emitContactAudit(eventBus, {
      schemaName: 'tenant_acme',
      action: AuditAction.ContactDeleted,
      entityId: 'c-2',
      userId: undefined,
      description: 'Contact c-2 deleted',
    })

    const event = eventBus.emit.mock.calls[0][1] as AuditEntityEvent
    expect(event.userId).toBeUndefined()
    expect(event.action).toBe(AuditAction.ContactDeleted)
  })
})
