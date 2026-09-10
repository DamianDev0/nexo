'use client'

import dynamic from 'next/dynamic'

import { Composer } from '@/shared/ui/organisms/composer'

import { resolveLogKind, resolveMessageChannel } from '../../lib/message-channel'
import { useComposerPreload } from '../../model/useComposerPreload'

import type { ContactComposers } from '../../model/useContactComposers'
import type { ComposerPlacement } from '@/shared/ui/organisms/composer'

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

type ContactComposerHostProps = {
  readonly composers: ContactComposers
  readonly placement?: ComposerPlacement
}

export function ContactComposerHost({
  composers,
  placement = 'corner',
}: Readonly<ContactComposerHostProps>) {
  useComposerPreload()
  const { active, close } = composers
  const channel = resolveMessageChannel(active)
  const logKind = resolveLogKind(active)

  return (
    <Composer.Placement value={placement}>
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
  )
}
