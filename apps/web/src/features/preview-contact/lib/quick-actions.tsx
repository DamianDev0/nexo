import { contactDialNumber } from '@/entities/contact'
import {
  CalendarBlankIcon,
  ChatTextIcon,
  CheckSquareIcon,
  EnvelopeSimpleIcon,
  NotePencilIcon,
  PencilSimpleIcon,
  PhoneIcon,
  PlusIcon,
  TagIcon,
  WhatsappLogoIcon,
} from '@/shared/ui/icons'

import type { ContactRowActions } from '@/entities/contact'
import type { ActionMenuItem } from '@/shared/ui/molecules/action-menu'
import type { QuickAction } from '@/shared/ui/organisms/record-drawer'
import type { ContactListItem } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export type ContactQuickActions = {
  readonly items: ReadonlyArray<QuickAction>
  readonly primary: QuickAction
}

export function contactPrimaryNumber(contact: ContactListItem): string | null {
  return contact.phone ?? contact.whatsapp
}

export function buildContactQuickActions(
  t: TFunction,
  contact: ContactListItem,
  actions: ContactRowActions,
): ContactQuickActions {
  const number = contactPrimaryNumber(contact)
  const items: QuickAction[] = [
    {
      id: 'call',
      label: t('contacts.preview.quickActions.call'),
      icon: <PhoneIcon />,
      disabled: number === null || !actions.onCall,
      onClick: () => {
        if (number !== null) actions.onCall?.(contactDialNumber(number))
      },
    },
    {
      id: 'whatsapp',
      label: t('contacts.preview.quickActions.whatsapp'),
      icon: <WhatsappLogoIcon />,
      disabled: !actions.onCompose,
      onClick: () => actions.onCompose?.('whatsapp', contact),
    },
    {
      id: 'email',
      label: t('contacts.preview.quickActions.email'),
      icon: <EnvelopeSimpleIcon />,
      disabled: !actions.onCompose,
      onClick: () => actions.onCompose?.('email', contact),
    },
    {
      id: 'note',
      label: t('contacts.preview.quickActions.note'),
      icon: <NotePencilIcon />,
      disabled: !actions.onAddNote,
      onClick: () => actions.onAddNote?.(contact),
    },
    {
      id: 'task',
      label: t('contacts.preview.quickActions.task'),
      icon: <CheckSquareIcon />,
      disabled: !actions.onLogActivity,
      onClick: () => actions.onLogActivity?.('task', contact),
    },
    {
      id: 'tag',
      label: t('contacts.preview.quickActions.tag'),
      icon: <TagIcon />,
      disabled: !actions.onEditTags,
      onClick: () => actions.onEditTags?.(contact),
    },
    {
      id: 'meeting',
      label: t('contacts.preview.quickActions.meeting'),
      icon: <CalendarBlankIcon />,
      disabled: !actions.onLogActivity,
      onClick: () => actions.onLogActivity?.('meeting', contact),
    },
  ]

  const menu: ActionMenuItem[] = [
    ...items.map(({ id, label, icon, onClick }) => ({ id, label, icon, onClick })),
    {
      id: 'sms',
      label: t('contacts.preview.quickActions.sms'),
      icon: <ChatTextIcon />,
      onClick: () => actions.onCompose?.('sms', contact),
    },
    {
      id: 'edit',
      label: t('contacts.preview.quickActions.edit', { entity: '' }).trim(),
      icon: <PencilSimpleIcon />,
      onClick: () => actions.onOpen?.(contact),
    },
  ].filter((item) => !items.find((action) => action.id === item.id)?.disabled)

  return {
    items,
    primary: {
      id: 'more',
      label: t('contacts.preview.quickActions.more'),
      icon: <PlusIcon />,
      menu,
    },
  }
}
