'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import { useAuth } from '@/entities/session'
import { useTagCatalog } from '@/entities/tag'
import { memberOptions, useTeamMembers } from '@/entities/team-member'

import { ADVANCED_FILTER_ICONS } from '../config/advanced-filter-icons.constants'
import { buildAdvancedFilterFields } from '../lib/advanced-filter-fields'

import type { FilterFieldDef } from '@/shared/ui/organisms/filter-bar'
import type { ContactColumnDef } from '@repo/shared-types'

export function useAdvancedFilterFields(
  catalog: ReadonlyArray<ContactColumnDef>,
): ReadonlyArray<FilterFieldDef> {
  const { t } = useTranslation()
  const taxonomy = useContactTaxonomy()
  const tagsByName = useTagCatalog('contact')
  const members = useTeamMembers()
  const { data: me } = useAuth()

  return useMemo(
    () =>
      buildAdvancedFilterFields(
        t,
        catalog,
        {
          statuses: taxonomy.statuses,
          sources: taxonomy.sources,
          lifecycleStages: taxonomy.lifecycleStages,
          tags: [...tagsByName.keys()],
          members: memberOptions(members, me?.id, t('contacts.lists.you')),
        },
        ADVANCED_FILTER_ICONS,
      ),
    [t, catalog, taxonomy, tagsByName, members, me?.id],
  )
}
