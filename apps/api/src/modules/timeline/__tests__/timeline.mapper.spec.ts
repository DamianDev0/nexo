import { mapTimelineRow } from '../mappers/timeline.mapper'
import type { TimelineRow } from '../interfaces/timeline-row.interfaces'

function makeRow(overrides: Partial<TimelineRow> = {}): TimelineRow {
  return {
    id: 'row-1',
    event_type: 'activity',
    title: 'Called the contact',
    description: 'Follow-up call',
    entity_type: 'activity',
    entity_id: 'row-1',
    user_id: 'user-1',
    user_name: 'Jane Doe',
    metadata: { foo: 'bar' },
    created_at: '2026-08-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('mapTimelineRow', () => {
  it('maps every snake_case field to its camelCase counterpart', () => {
    const row = makeRow()

    expect(mapTimelineRow(row)).toEqual({
      id: 'row-1',
      eventType: 'activity',
      title: 'Called the contact',
      description: 'Follow-up call',
      entityType: 'activity',
      entityId: 'row-1',
      userId: 'user-1',
      userName: 'Jane Doe',
      metadata: { foo: 'bar' },
      createdAt: '2026-08-01T00:00:00.000Z',
    })
  })

  it('defaults metadata to an empty object when null', () => {
    const row = makeRow({ metadata: null as unknown as Record<string, unknown> })

    expect(mapTimelineRow(row).metadata).toEqual({})
  })

  it('defaults metadata to an empty object when undefined', () => {
    const row = makeRow({ metadata: undefined as unknown as Record<string, unknown> })

    expect(mapTimelineRow(row).metadata).toEqual({})
  })

  it('preserves null description, entity references and user fields', () => {
    const row = makeRow({
      description: null,
      entity_type: null,
      entity_id: null,
      user_id: null,
      user_name: null,
    })

    const entry = mapTimelineRow(row)

    expect(entry.description).toBeNull()
    expect(entry.entityType).toBeNull()
    expect(entry.entityId).toBeNull()
    expect(entry.userId).toBeNull()
    expect(entry.userName).toBeNull()
  })

  it('maps deal event types through unchanged', () => {
    const row = makeRow({
      event_type: 'deal_won',
      entity_type: 'deal',
      metadata: { valueCents: 5_000_000, status: 'won' },
    })

    const entry = mapTimelineRow(row)

    expect(entry.eventType).toBe('deal_won')
    expect(entry.metadata).toEqual({ valueCents: 5_000_000, status: 'won' })
  })
})
