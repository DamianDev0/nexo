import { describe, expect, it } from 'vitest'

import { orderSmartLists } from '@/widgets/contacts-board/lib/order-smart-lists'

const item = (id: string, pinned?: boolean) => ({ id, label: id, pinned })

const ITEMS = [item('all', true), item('mine'), item('archived'), item('new'), item('qualified')]

describe('orderSmartLists', () => {
  it('returns the items untouched when there is no stored order', () => {
    expect(orderSmartLists(ITEMS, undefined)).toBe(ITEMS)
  })

  it('keeps pinned, ownership and archived lists ahead of the stored status order', () => {
    expect(orderSmartLists(ITEMS, ['qualified', 'new', 'all']).map((entry) => entry.id)).toEqual([
      'all',
      'mine',
      'archived',
      'qualified',
      'new',
    ])
  })

  it('sends statuses missing from the stored order to the end', () => {
    expect(orderSmartLists(ITEMS, ['qualified']).map((entry) => entry.id)).toEqual([
      'all',
      'mine',
      'archived',
      'qualified',
      'new',
    ])
  })
})
