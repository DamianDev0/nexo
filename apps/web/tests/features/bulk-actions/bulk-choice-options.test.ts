import { describe, expect, it } from 'vitest'

import type { TeamMember } from '@repo/shared-types'

import {
  matchesChoice,
  memberChoiceOptions,
  taxonomyChoiceOptions,
} from '@/features/bulk-actions/lib/bulk-choice-options'

const member = (id: string, fullName: string, role = 'sales_rep'): TeamMember => ({
  id,
  fullName,
  email: `${id}@acme.co`,
  avatarUrl: null,
  role: role as TeamMember['role'],
})

const LABELS = {
  viewerId: 'u1',
  you: 'tú',
  role: (role: string) => `role:${role}`,
}

describe('bulk choice options', () => {
  it('turns taxonomy choices into colored options', () => {
    expect(
      taxonomyChoiceOptions([
        { key: 'new', label: 'Nuevo', color: '#60A5FA' },
        { key: 'client', label: 'Cliente', color: '#22C55E' },
      ]),
    ).toEqual([
      { value: 'new', label: 'Nuevo', color: '#60A5FA' },
      { value: 'client', label: 'Cliente', color: '#22C55E' },
    ])
  })

  it('turns team members into rich options with email, role badge and initials', () => {
    expect(
      memberChoiceOptions([member('u1', 'Ana Ruiz'), member('u2', 'Beto', 'manager')], LABELS),
    ).toEqual([
      {
        value: 'u1',
        label: 'Ana Ruiz (tú)',
        description: 'u1@acme.co',
        badge: 'role:sales_rep',
        initials: 'AR',
      },
      {
        value: 'u2',
        label: 'Beto',
        description: 'u2@acme.co',
        badge: 'role:manager',
        initials: 'BE',
      },
    ])
  })

  it('matches search terms against label, email and badge', () => {
    const [option] = memberChoiceOptions([member('u2', 'Beto Díaz', 'manager')], LABELS)
    if (!option) throw new Error('missing option')
    expect(matchesChoice(option, 'beto')).toBe(true)
    expect(matchesChoice(option, 'acme')).toBe(true)
    expect(matchesChoice(option, 'MANAGER')).toBe(true)
    expect(matchesChoice(option, 'zzz')).toBe(false)
  })
})
