'use client'

import { ContactFormSheet } from '@/features/create-contact'

import { useContactsBoard } from '../../model/useContactsBoard'
import { ContactsTable } from '../ContactsTable'

export function ContactsBoard() {
  const { instance, lists, state, actions, sheet } = useContactsBoard()

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ContactsTable instance={instance} lists={lists} state={state} actions={actions} />
      <ContactFormSheet
        contact={sheet.contact}
        open={sheet.open}
        onOpenChange={sheet.onOpenChange}
      />
    </div>
  )
}
