import { request } from '@/shared/api/request'

import type { TeamMember } from '@repo/shared-types'

const usersService = {
  listMembers: () => request<TeamMember[]>({ method: 'get', url: '/users' }),
}

export default usersService
