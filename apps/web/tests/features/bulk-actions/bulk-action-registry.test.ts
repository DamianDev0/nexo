import { describe, expect, it } from 'vitest'

import {
  BULK_ACTION_IDS,
  BULK_ACTION_REGISTRY,
} from '@/features/bulk-actions/config/bulk-action-registry.constants'
import {
  buildActionRequest,
  bulkActionsFor,
  bulkScope,
} from '@/features/bulk-actions/lib/bulk-action-registry'

describe('bulk action registry', () => {
  it('declares every id exactly once and keeps ids consistent', () => {
    for (const id of BULK_ACTION_IDS) expect(BULK_ACTION_REGISTRY[id].id).toBe(id)
  })

  it('lists active-list actions in bar order and only restore + export for archived', () => {
    expect(bulkActionsFor('active').map((def) => def.id)).toEqual([
      'add_tags',
      'remove_tags',
      'status',
      'lifecycle',
      'assign',
      'export',
      'archive',
    ])
    expect(bulkActionsFor('archived').map((def) => def.id)).toEqual(['restore', 'export'])
    expect(bulkScope(true)).toBe('archived')
    expect(bulkScope(false)).toBe('active')
  })

  it('maps a UI action to its backend kind and merges declared params first', () => {
    const request = buildActionRequest(
      'lifecycle',
      'contacts',
      { mode: 'ids', ids: ['a'] },
      { value: 'customer' },
    )
    expect(request).toEqual({
      entity: 'contacts',
      action: 'update_field',
      params: { field: 'lifecycleStage', value: 'customer' },
      selection: { mode: 'ids', ids: ['a'] },
    })
    expect(buildActionRequest('archive', 'deals', { mode: 'ids', ids: ['a'] })).toMatchObject({
      entity: 'deals',
      action: 'archive',
      params: {},
    })
  })
})
