'use client'

import dynamic from 'next/dynamic'

import { ContactComposerHost } from '@/features/compose-contact-actions'
import { useMountedOnce } from '@/shared/lib/hooks/useMountedOnce'

import { useContactsBoard } from '../../model/useContactsBoard'
import { useListMenu } from '../../model/useListMenu'
import { ContactsTable } from '../ContactsTable'

const ContactFormSheet = dynamic(
  () => import('@/features/create-contact').then((m) => m.ContactFormSheet),
  { loading: () => null, ssr: false },
)

const ContactRecordDrawer = dynamic(
  () => import('@/features/preview-contact').then((m) => m.ContactRecordDrawer),
  { loading: () => null, ssr: false },
)

const ViewTabDialogs = dynamic(
  () => import('@/features/manage-contact-views').then((m) => m.ViewTabDialogs),
  { loading: () => null, ssr: false },
)

export function ContactsBoard() {
  const { instance, lists, state, actions, bulk, sheet, preview, composers } = useContactsBoard()
  const listMenu = useListMenu(state.views, state.viewerId)

  const viewDialogsMounted = useMountedOnce(listMenu.viewMenu.openMode !== null)
  const formMounted = useMountedOnce(sheet.open)
  const previewMounted = useMountedOnce(preview.open)
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ContactsTable board={{ instance, lists, state, actions }} bulk={bulk} listMenu={listMenu} />
      {viewDialogsMounted && <ViewTabDialogs menu={listMenu.viewMenu} />}
      {formMounted && (
        <ContactFormSheet
          contact={sheet.contact}
          open={sheet.open}
          onOpenChange={sheet.onOpenChange}
        />
      )}
      {previewMounted && preview.contact && (
        <ContactRecordDrawer
          record={{
            contact: preview.contact,
            siblings: preview.siblings,
            onSelect: preview.onSelect,
          }}
          open={preview.open}
          onOpenChange={preview.onOpenChange}
          actions={preview.actions}
          taxonomy={preview.taxonomy}
        />
      )}
      <ContactComposerHost composers={composers} placement={preview.open ? 'aside' : 'corner'} />
    </div>
  )
}
