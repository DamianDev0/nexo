import 'server-only'

import { apiFetch } from '../client'

import type { TeamMember } from '@repo/shared-types'

export const listTeamMembers = () => apiFetch<TeamMember[]>('/users', { cache: 'no-store' })
