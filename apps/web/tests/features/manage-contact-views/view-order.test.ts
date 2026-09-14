import { describe, expect, it } from 'vitest'

import type { ContactView } from '@repo/shared-types'

import { ownedViewOrder } from '@/features/manage-contact-views'

function view(id: string, ownerId: string): ContactView {
  return { id, ownerId, name: id, position: 0 } as ContactView
}

const VIEWS = [view('a', 'me'), view('b', 'me'), view('c', 'someone-else')]

describe('ownedViewOrder', () => {
  it('reads the view ids out of the dragged strip, in the new order', () => {
    const order = ['all', 'view:b', 'mine', 'view:a']

    expect(ownedViewOrder(order, VIEWS, 'me')).toEqual(['b', 'a'])
  })

  it('never reorders a view someone else owns', () => {
    const order = ['view:c', 'view:a', 'view:b']

    expect(ownedViewOrder(order, VIEWS, 'me')).toEqual(['a', 'b'])
  })

  it('stays quiet when there is nothing to persist', () => {
    expect(ownedViewOrder(['all', 'mine'], VIEWS, 'me')).toEqual([])
    expect(ownedViewOrder(['view:a'], VIEWS, 'me')).toEqual([])
    expect(ownedViewOrder(['view:a', 'view:b'], VIEWS, null)).toEqual([])
  })

  it('drops ids of views that no longer exist', () => {
    expect(ownedViewOrder(['view:a', 'view:gone', 'view:b'], VIEWS, 'me')).toEqual(['a', 'b'])
  })
})
