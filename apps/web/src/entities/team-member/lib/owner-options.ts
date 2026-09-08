import type { AssigneeOption } from '@/shared/ui/molecules/assignee-picker'
import type { TeamMember } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export function buildOwnerOptions(
  t: TFunction,
  members: ReadonlyArray<TeamMember>,
): ReadonlyArray<AssigneeOption> {
  return members.map((member) => ({
    id: member.id,
    name: member.fullName,
    meta: member.email,
    badge: t(`common.roles.${member.role}`),
    avatarUrl: member.avatarUrl,
  }))
}
