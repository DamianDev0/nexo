import { memberOptions } from '@/entities/team-member'
import { initialsOf } from '@/shared/lib/initials'

import type { BulkChoiceOption } from '../model/types/bulk-actions.types'
import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { TeamMember } from '@repo/shared-types'

export function taxonomyChoiceOptions(
  choices: ReadonlyArray<TaxonomyChoice>,
): ReadonlyArray<BulkChoiceOption> {
  return choices.map((choice) => ({ value: choice.key, label: choice.label, color: choice.color }))
}

type MemberLabels = {
  readonly viewerId: string | null | undefined
  readonly you: string
  readonly role: (role: TeamMember['role']) => string
}

export function memberChoiceOptions(
  members: ReadonlyArray<TeamMember>,
  labels: MemberLabels,
): ReadonlyArray<BulkChoiceOption> {
  const base = memberOptions(members, labels.viewerId, labels.you)
  return members.map((member, index) => ({
    value: member.id,
    label: base[index]?.label ?? member.fullName,
    description: member.email,
    badge: labels.role(member.role),
    initials: initialsOf(member.fullName),
  }))
}

export function matchesChoice(option: BulkChoiceOption, needle: string): boolean {
  const haystack = `${option.label} ${option.description ?? ''} ${option.badge ?? ''}`.toLowerCase()
  return haystack.includes(needle.toLowerCase())
}
