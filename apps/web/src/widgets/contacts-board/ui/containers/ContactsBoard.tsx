'use client'

import dynamic from 'next/dynamic'

import { useMountedOnce } from '@/shared/lib/hooks/useMountedOnce'

import { useContactsBoard } from '../../model/useContactsBoard'
import { ContactsTable } from '../ContactsTable'

import { useListMenu } from './useListMenu'

const ContactFormSheet = dynamic(() =>
  import('@/features/create-contact').then((m) => m.ContactFormSheet),
)

const ContactPreviewSheet = dynamic(() =>
  import('@/entities/contact').then((m) => m.ContactPreviewSheet),
)

export function ContactsBoard() {
  const { instance, lists, state, actions, sheet, preview } = useContactsBoard()
  const listMenu = useListMenu(state.views)

  const formMounted = useMountedOnce(sheet.open)
  const previewMounted = useMountedOnce(preview.open)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ContactsTable
        instance={instance}
        lists={lists}
        state={state}
        actions={actions}
        listMenu={listMenu}
      />
      {formMounted && (
        <ContactFormSheet
          contact={sheet.contact}
          open={sheet.open}
          onOpenChange={sheet.onOpenChange}
        />
      )}
      {previewMounted && (
        <ContactPreviewSheet
          contact={preview.contact}
          open={preview.open}
          onOpenChange={preview.onOpenChange}
          onEdit={preview.onEdit}
          taxonomy={preview.taxonomy}
        />
      )}
    </div>
  )
}
