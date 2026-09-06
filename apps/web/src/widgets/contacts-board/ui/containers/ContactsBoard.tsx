'use client'

import dynamic from 'next/dynamic'

import { useMountedOnce } from '@/shared/lib/hooks/useMountedOnce'

import { resolveMessageChannel } from '../../lib/message-channel'
import { useComposerPreload } from '../../model/useComposerPreload'
import { useContactsBoard } from '../../model/useContactsBoard'
import { useListMenu } from '../../model/useListMenu'
import { ContactsTable } from '../ContactsTable'

const ContactFormSheet = dynamic(() =>
  import('@/features/create-contact').then((m) => m.ContactFormSheet),
)

const ContactPreviewSheet = dynamic(() =>
  import('@/entities/contact').then((m) => m.ContactPreviewSheet),
)

const NoteComposer = dynamic(() =>
  import('@/features/add-contact-note').then((m) => m.NoteComposer),
)

const TagComposer = dynamic(() => import('@/features/tag-contact').then((m) => m.TagComposer))

const MessageComposer = dynamic(() =>
  import('@/features/compose-message').then((m) => m.MessageComposer),
)

const ViewTabDialogs = dynamic(() =>
  import('@/features/manage-contact-views').then((m) => m.ViewTabDialogs),
)

export function ContactsBoard() {
  const { instance, lists, state, actions, bulk, sheet, preview, composers } = useContactsBoard()
  const listMenu = useListMenu(state.views)
  useComposerPreload()

  const viewDialogsMounted = useMountedOnce(listMenu.viewMenu.openMode !== null)
  const formMounted = useMountedOnce(sheet.open)
  const previewMounted = useMountedOnce(preview.open)
  const { active, close } = composers
  const channel = resolveMessageChannel(active)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ContactsTable
        instance={instance}
        lists={lists}
        state={state}
        actions={actions}
        bulk={bulk}
        listMenu={listMenu}
      />
      {viewDialogsMounted && <ViewTabDialogs menu={listMenu.viewMenu} />}
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
      {active?.kind === 'note' && (
        <NoteComposer key={active.contact.id} contact={active.contact} onClose={close} />
      )}
      {active?.kind === 'tags' && (
        <TagComposer key={active.contact.id} contact={active.contact} onClose={close} />
      )}
      {active && channel && (
        <MessageComposer
          key={`${channel}:${active.contact.id}`}
          channel={channel}
          contact={active.contact}
          onClose={close}
        />
      )}
    </div>
  )
}
