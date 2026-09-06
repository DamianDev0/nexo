import type { TeamMember } from '@repo/shared-types'

export type MemberOption = {
  readonly value: string
  readonly label: string
}

export function memberOptions(
  members: ReadonlyArray<TeamMember>,
  viewerId?: string | null,
  youLabel?: string,
): ReadonlyArray<MemberOption> {
  return members.map((member) => ({
    value: member.id,
    label:
      viewerId && member.id === viewerId && youLabel
        ? `${member.fullName} (${youLabel})`
        : member.fullName,
  }))
}
