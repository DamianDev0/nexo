'use client'

import dynamic from 'next/dynamic'

import { useMountedOnce } from '@/shared/lib/hooks/useMountedOnce'
import { Composer } from '@/shared/ui/organisms/composer'

import { resolveLogKind, resolveMessageChannel } from '../../lib/message-channel'
import { useComposerPreload } from '../../model/useComposerPreload'
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

const ActivityComposer = dynamic(
  () => import('@/features/log-contact-activity').then((m) => m.ActivityComposer),
  { loading: () => null, ssr: false },
)

const NoteComposer = dynamic(
  () => import('@/features/add-contact-note').then((m) => m.NoteComposer),
  { loading: () => null, ssr: false },
)

const TagComposer = dynamic(() => import('@/features/tag-contact').then((m) => m.TagComposer), {
  loading: () => null,
  ssr: false,
})

const MessageComposer = dynamic(
  () => import('@/features/compose-message').then((m) => m.MessageComposer),
  { loading: () => null, ssr: false },
)

const ViewTabDialogs = dynamic(
  () => import('@/features/manage-contact-views').then((m) => m.ViewTabDialogs),
  { loading: () => null, ssr: false },
)

export function ContactsBoard() {
  const { instance, lists, state, actions, bulk, sheet, preview, composers } = useContactsBoard()
  const listMenu = useListMenu(state.views, state.viewerId)
  useComposerPreload()

  const viewDialogsMounted = useMountedOnce(listMenu.viewMenu.openMode !== null)
  const formMounted = useMountedOnce(sheet.open)
  const previewMounted = useMountedOnce(preview.open)
  const { active, close } = composers
  const channel = resolveMessageChannel(active)
  const logKind = resolveLogKind(active)

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
      <Composer.Placement value={preview.open ? 'aside' : 'corner'}>
        {active?.kind === 'note' && (
          <NoteComposer key={active.contact.id} contact={active.contact} onClose={close} />
        )}
        {active?.kind === 'tags' && (
          <TagComposer key={active.contact.id} contact={active.contact} onClose={close} />
        )}
        {active && logKind && (
          <ActivityComposer
            key={`${logKind}:${active.contact.id}`}
            kind={logKind}
            contact={active.contact}
            onClose={close}
          />
        )}
        {active && channel && (
          <MessageComposer
            key={`${channel}:${active.contact.id}`}
            channel={channel}
            contact={active.contact}
            onClose={close}
          />
        )}
      </Composer.Placement>
    </div>
  )
}
