'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { CONTACT_DESCRIPTOR } from '@/entities/contact'
import { useEntityTerms } from '@/entities/nomenclature'
import {
  ContactsListHint,
  LIST_ALL,
  LIST_UNASSIGNED,
  UnassignedBadge,
} from '@/features/filter-contacts'
import { buildToolbarMenu, RecordsTable } from '@/widgets/records-board'

import type { ContactsBoard } from '../model/useContactsBoard'
import type { ListMenu } from '@/widgets/records-board'

type ContactsTableProps = {
  readonly board: Pick<ContactsBoard, 'instance' | 'lists' | 'state' | 'actions'>
  readonly bulk: ContactsBoard['bulk']
  readonly listMenu: ListMenu
}

export function ContactsTable({ board, bulk, listMenu }: Readonly<ContactsTableProps>) {
  const { lists, state, actions } = board
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')

  const slots = useMemo(
    () => ({
      toolbarMenu: buildToolbarMenu(t, CONTACT_DESCRIPTOR.routes),
      announcement: <ContactsListHint hints={state.listHints} />,
      searchExtras: (
        <UnassignedBadge
          count={state.unassignedRecent}
          active={lists.activeId === LIST_UNASSIGNED}
          terms={{ entity: terms.lowerSingular, entities: terms.lowerPlural }}
          onSelect={() => actions.onSelectList(LIST_UNASSIGNED)}
          onClear={() => actions.onSelectList(LIST_ALL)}
        />
      ),
    }),
    [t, state.listHints, state.unassignedRecent, lists.activeId, terms, actions],
  )

  return <RecordsTable board={board} bulk={bulk} listMenu={listMenu} slots={slots} />
}
