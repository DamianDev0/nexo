'use client'

import { useTranslation } from 'react-i18next'

import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import { useAuth } from '@/entities/session'
import { useTeamMembers } from '@/entities/team-member'

import { memberChoiceOptions, taxonomyChoiceOptions } from '../lib/bulk-choice-options'

import type { BulkChoiceKind, BulkChoiceOption } from './types/bulk-actions.types'
import type { TeamMember } from '@repo/shared-types'

export function useBulkChoiceOptions(kind: BulkChoiceKind): ReadonlyArray<BulkChoiceOption> {
  const { t } = useTranslation()
  const taxonomy = useContactTaxonomy()
  const members = useTeamMembers()
  const { data: me } = useAuth()

  if (kind === 'status') return taxonomyChoiceOptions(taxonomy.statuses)
  if (kind === 'lifecycle') return taxonomyChoiceOptions(taxonomy.lifecycleStages)
  return memberChoiceOptions(members, {
    viewerId: me?.id,
    you: t('contacts.lists.you'),
    role: (role: TeamMember['role']) => t(`common.roles.${role}`),
  })
}
