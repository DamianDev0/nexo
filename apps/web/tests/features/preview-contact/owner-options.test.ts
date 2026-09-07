import { describe, expect, it } from 'vitest'

import type { TeamMember } from '@repo/shared-types'

import { buildOwnerOptions } from '@/features/preview-contact/lib/owner-options'

const t = ((key: string) => key) as never

const MEMBER: TeamMember = {
  id: 'u1',
  fullName: 'Ana Guerrero',
  email: 'ana@nexo.co',
  avatarUrl: null,
  role: 'admin' as TeamMember['role'],
}

describe('buildOwnerOptions', () => {
  it('maps members into assignee options with the role label', () => {
    expect(buildOwnerOptions(t, [MEMBER])).toEqual([
      {
        id: 'u1',
        name: 'Ana Guerrero',
        meta: 'ana@nexo.co',
        badge: 'common.roles.admin',
        avatarUrl: null,
      },
    ])
  })
})
