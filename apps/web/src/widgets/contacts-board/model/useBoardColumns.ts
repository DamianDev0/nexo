'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { buildContactColumns, usePendingContactPatches } from '@/entities/contact'
import { useTagCatalog } from '@/entities/tag'
import { buildOwnerOptions, useTeamMembers } from '@/entities/team-member'

import type { ContactRowActions, ContactTaxonomyMaps } from '@/entities/contact'
import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { ContactColumnDef } from '@repo/shared-types'

type BoardTaxonomy = ContactTaxonomyMaps & {
  readonly statuses: ReadonlyArray<TaxonomyChoice>
  readonly sources: ReadonlyArray<TaxonomyChoice>
  readonly lifecycleStages: ReadonlyArray<TaxonomyChoice>
}

type BoardColumnsInput = {
  readonly catalog: ReadonlyArray<ContactColumnDef>
  readonly taxonomy: BoardTaxonomy
  readonly rowActions: ContactRowActions
  readonly entity: string
  readonly dense: boolean
}

export function useBoardColumns({
  catalog,
  taxonomy,
  rowActions,
  entity,
  dense,
}: BoardColumnsInput) {
  const { t, i18n } = useTranslation()
  const tagsByName = useTagCatalog('contact')
  const members = useTeamMembers()
  const owners = useMemo(() => buildOwnerOptions(t, members), [t, members])
  const pendingIds = usePendingContactPatches((state) => state.ids)

  return useMemo(
    () =>
      buildContactColumns(catalog, {
        t,
        locale: i18n.language,
        entity,
        dense,
        statuses: taxonomy.statuses,
        sources: taxonomy.sources,
        lifecycleStages: taxonomy.lifecycleStages,
        owners,
        pendingIds,
        actions: rowActions,
        taxonomy,
        tagsByName,
      }),
    [
      catalog,
      t,
      i18n.language,
      entity,
      dense,
      taxonomy,
      owners,
      pendingIds,
      rowActions,
      tagsByName,
    ],
  )
}
