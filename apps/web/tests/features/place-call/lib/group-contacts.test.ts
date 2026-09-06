import { describe, expect, it } from 'vitest'

import type { ContactListItem } from '@repo/shared-types'

import { groupContactsByInitial } from '@/features/place-call/lib/group-contacts'

function contact(id: string, firstName: string, lastName?: string): ContactListItem {
  return { id, firstName, lastName } as ContactListItem
}

describe('groupContactsByInitial', () => {
  it('groups contacts under their first-name initial, sorted alphabetically', () => {
    const groups = groupContactsByInitial([
      contact('1', 'Laura'),
      contact('2', 'Andrés'),
      contact('3', 'ana'),
    ])

    expect(groups.map((group) => group.letter)).toEqual(['A', 'L'])
    expect(groups[0]?.contacts.map((item) => item.id)).toEqual(['2', '3'])
  })

  it('falls back to the last name when the first name is blank', () => {
    const groups = groupContactsByInitial([contact('1', ' ', 'Zuluaga')])

    expect(groups[0]?.letter).toBe('Z')
  })

  it('buckets non-letter initials under #', () => {
    const groups = groupContactsByInitial([contact('1', '123 Servicios'), contact('2', '')])

    expect(groups).toHaveLength(1)
    expect(groups[0]?.letter).toBe('#')
    expect(groups[0]?.contacts).toHaveLength(2)
  })

  it('returns an empty list untouched', () => {
    expect(groupContactsByInitial([])).toEqual([])
  })
})
