import { describe, expect, it } from 'vitest'

import { columnFields } from '@/entities/contact/lib/contact-column-saving'

describe('columnFields', () => {
  it('maps a contact column to the fields it renders', () => {
    expect(columnFields('assignedTo')).toEqual(['assignedToId', 'assignedToName'])
    expect(columnFields('custom:eps')).toEqual(['customFields'])
    expect(columnFields('unknown')).toEqual([])
  })
})
