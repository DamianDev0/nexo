import { describe, expect, it } from 'vitest'

import type { TeamMember } from '@repo/shared-types'

import { memberOptions } from '@/entities/team-member/lib/member-options'

const member = (id: string, fullName: string): TeamMember => ({
  id,
  fullName,
  email: `${id}@acme.co`,
  avatarUrl: null,
  role: 'sales_rep' as TeamMember['role'],
})

describe('memberOptions', () => {
  it('maps members to select options and tags the viewer', () => {
    const options = memberOptions([member('u1', 'Ana'), member('u2', 'Beto')], 'u2', 'you')
    expect(options).toEqual([
      { value: 'u1', label: 'Ana' },
      { value: 'u2', label: 'Beto (you)' },
    ])
  })

  it('leaves labels untouched without a viewer or a label for them', () => {
    expect(memberOptions([member('u1', 'Ana')])).toEqual([{ value: 'u1', label: 'Ana' }])
    expect(memberOptions([member('u1', 'Ana')], 'u1')).toEqual([{ value: 'u1', label: 'Ana' }])
  })
})
