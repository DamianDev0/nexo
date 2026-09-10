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

function missingReason(t: TFunction, fieldKey: string): string {
  return t('contacts.completeness.field', { field: t(fieldKey).toLocaleLowerCase() })
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
      reason: number === null ? missingReason(t, 'contacts.form.phone') : undefined,
      onClick: () => {
        if (number !== null) actions.onCall?.(contactDialNumber(number))
      },
    },
    {
      id: 'whatsapp',
      label: t('contacts.preview.quickActions.whatsapp'),
      icon: <WhatsappLogoIcon />,
      disabled: number === null || !actions.onCompose,
      reason: number === null ? missingReason(t, 'contacts.form.whatsapp') : undefined,
      onClick: () => actions.onCompose?.('whatsapp', contact),
    },
    {
      id: 'email',
      label: t('contacts.preview.quickActions.email'),
      icon: <EnvelopeSimpleIcon />,
      disabled: !contact.email || !actions.onCompose,
      reason: contact.email ? undefined : missingReason(t, 'contacts.form.email'),
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

  const extras: ReadonlyArray<QuickAction> = [
    {
      id: 'sms',
      label: t('contacts.preview.quickActions.sms'),
      icon: <ChatTextIcon />,
      disabled: !contact.phone || !actions.onCompose,
      onClick: () => actions.onCompose?.('sms', contact),
    },
    {
      id: 'edit',
      label: t('contacts.preview.quickActions.edit', { entity: '' }).trim(),
      icon: <PencilSimpleIcon />,
      disabled: !actions.onOpen,
      onClick: () => actions.onOpen?.(contact),
    },
  ]

  const menu: ActionMenuItem[] = [...items, ...extras]
    .filter((action) => !action.disabled)
    .map(({ id, label, icon, onClick }) => ({ id, label, icon, onClick }))

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
