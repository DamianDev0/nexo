'use client'

import { useQuery } from '@tanstack/react-query'

import usersService from '@/shared/api/services/users.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { TeamMember } from '@repo/shared-types'

const MEMBERS_STALE_MS = 5 * 60 * 1000

const EMPTY_MEMBERS: ReadonlyArray<TeamMember> = []

export function useTeamMembers(): ReadonlyArray<TeamMember> {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.team.members,
    queryFn: usersService.listMembers,
    staleTime: MEMBERS_STALE_MS,
  })
  return data ?? EMPTY_MEMBERS
}
