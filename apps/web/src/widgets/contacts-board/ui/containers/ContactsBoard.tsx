'use client'

import { ContactPreviewSheet } from '@/entities/contact'
import { ContactFormSheet } from '@/features/create-contact'

import { useContactsBoard } from '../../model/useContactsBoard'
import { ContactsTable } from '../ContactsTable'

export function ContactsBoard() {
  const { instance, lists, state, actions, sheet, preview } = useContactsBoard()

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ContactsTable instance={instance} lists={lists} state={state} actions={actions} />
      <ContactFormSheet
        contact={sheet.contact}
        open={sheet.open}
        onOpenChange={sheet.onOpenChange}
      />
      <ContactPreviewSheet
        contact={preview.contact}
        open={preview.open}
        onOpenChange={preview.onOpenChange}
        onEdit={preview.onEdit}
        taxonomy={preview.taxonomy}
      />
    </div>
  )
}
